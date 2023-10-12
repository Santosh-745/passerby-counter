import { Location, LocationTimesheet } from "../database/models/index.js";

export const getLocationById = async (req, res) => {
    try {
        const id = +req.params.id;
        if(isNaN(id)) throw new Error('bad_request: Invalid ID');
    
        const { dataValues: location } = await Location.findByPk(id);
        if(!location) throw new Error('not_found: Location Not Found');

        return res.status(200).json({ statusCode: 200, data: location });
    } catch (error) {
        if(error.message.trim().toLowerCase().includes('not_found'))
            return res.status(404).json({
                error: error.message,
                statusCode: 404,
            });
        else if(error.message.trim().toLowerCase().includes('bad_request')) 
            return res.status(400).json({
                error: error.message,
                statusCode: 400,
            });
        return res.status(500).json({
            error,
            statusCode: 500
        });
    }
}

export const updateTimesheet = async (req, res) => {
    try {
        const id = +req.body.id;
        if(isNaN(id)) throw new Error('bad_request: Invalid ID');
        
        const inCount = req.body.inCount,
              outCount = req.body.outCount,
              startTime = req.body.startTime,
              endTime = req.body.endTime,
              reset = req.body.reset?.trim().toLowerCase() === 'true';
        
        const location = await Location.findByPk(id);
        if(!location) throw new Error('not_found: Location Not Found');
        if(!startTime) throw new Error('bad_request: start-time is required field');
        if(!endTime) throw new Error('bad_request: end-time is required field');

        let payload = {};
        if(!inCount && !outCount) 
            throw new Error('bad_request: pass atleast one inCount or outCount');
        if(inCount) {
            if(isNaN(inCount))
                throw new Error('bad_request: passed inCount is invalid');
            payload['inCount'] = +inCount;
        }
        if(outCount) {
            if(isNaN(outCount))
                throw new Error('bad_request: passed outCount is invalid');
            payload['outCount'] = +outCount;
        }

        if(reset) {
            payload['totalCount'] = (payload.inCount || 0) - (payload.outCount || 0);
            await Location.update({ 
                inCount: payload.inCount || 0,
                outCount: payload.outCount || 0,
                totalCount: payload.totalCount,
                resetTimestamp: startTime,
            }, { where: { id } });
        } else {
            const prevRecord = await LocationTimesheet.findOne({
                attributes: ['totalCount'],
                where: { locationId: id },
                order: [ ['startTime', 'desc'] ],
            });
            const oldTotalCount = prevRecord ? prevRecord.totalCount : 0;
            payload['totalCount'] = oldTotalCount + (payload.inCount || 0) - (payload.outCount || 0);

            await Location.increment({ 
                inCount: payload.inCount || 0,
                outCount: payload.outCount || 0,
            }, { where: { id } });
    
            await Location.update({ totalCount: payload.totalCount }, { where: { id } });    
        }

        payload = { ...payload, startTime, endTime };
        console.log(JSON.stringify(payload, null, 2));
        await LocationTimesheet.create({
            locationId: id,
            ...payload,
        });
        
        res.status(200).json({ statusCode: "200", message: "Count updated" });
    } catch(error) {
        console.log(error);
        if(error.message.trim().toLowerCase().includes('not_found'))
            return res.status(404).json({
                error: error.message,
                statusCode: 404,
            });
        else if(error.message.trim().toLowerCase().includes('bad_request')) 
            return res.status(400).json({
                error: error.message,
                statusCode: 400,
            });
        return res.status(500).json({
            error,
            statusCode: 500
        });
    }
}

// Business logic for automatic start-time & end-time detetction
export const increamentCountV1 = async (req, res) => {
    try {
        const id = +req.body.id;
        if(isNaN(id)) throw new Error('bad_request: Invalid ID');
        
        const inCount = req.body.inCount;
        const outCount = req.body.outCount;
        const THIRTY_MINUTES = (30 * 60 * 1000);
        let payload = {};

        if(!inCount && !outCount) 
            throw new Error('bad_request: pass atleast one inCount or outCount');
        
        const location = await Location.findByPk(id);
        if(!location) throw new Error('not_found: Location Not Found');

        if(inCount) {
            if(isNaN(inCount))
                throw new Error('bad_request: passed inCount is invalid');
            payload['inCount'] = +inCount;
        }

        if(outCount) {
            if(isNaN(outCount))
                throw new Error('bad_request: passed outCount is invalid');
            payload['outCount'] = +outCount;
        }

        //  *********** Update data in timesheet table ****************
        const currentTime = (new Date()).getTime();
        const lastEntry = await LocationTimesheet.findOne({
            where: { locationId: id, endTime: null },
        });

        if (!lastEntry) {
            // if (payload.inCount && payload.outCount && payload.inCount < payload.outCount)
            //     throw new Error('bad request: updated entry count would be less than exit count');
            await LocationTimesheet.create({
                startTime: currentTime,
                locationId: id,
                ...payload,
            });
        } else {
            const updatedInCount = +lastEntry.inCount + (+payload.inCount || 0),
                  updatedOutCount = +lastEntry.outCount + (+payload.outCount || 0);

            payload = {
                inCount: updatedInCount,
                outCount: updatedOutCount,
            }

            const isLastInterval = (updatedInCount === updatedOutCount) && (currentTime - lastEntry.startTime > THIRTY_MINUTES);
            if (isLastInterval) payload['endTime'] = currentTime;
            
            await LocationTimesheet.update(payload, { where: { id: lastEntry.id } });
        }
        
        res.status(200).json({ statusCode: "200", message: "Count updated" });
    } catch(error) {
        console.log(error);
        if(error.message.trim().toLowerCase().includes('not_found'))
            return res.status(404).json({
                error: error.message,
                statusCode: 404,
            });
        else if(error.message.trim().toLowerCase().includes('bad_request')) 
            return res.status(400).json({
                error: error.message,
                statusCode: 400,
            });
        return res.status(500).json({
            error,
            statusCode: 500
        });
    }
}

export const getTimesheet = async (req, res) => {
    try {
        const id = +req.params.id;
        const limit = +req.query.limit || 10, page = +req.query.page || 0;
        
        if(isNaN(id)) throw new Error('bad_request: Invalid ID');
    
        const { dataValues: location } = await Location.findByPk(id);
        if(!location) throw new Error('not_found: Location Not Found');

        const { rows: timesheet, count } = await LocationTimesheet.findAndCountAll({
            where: { locationId: id },
            order: [ ['startTime', 'desc'] ],
            limit, 
            offset: limit * page,
        });

        const data = { 
            ...location, 
            timesheet, 
            pageSize: limit, 
            pageIndex: page, 
            totalCount: count 
        };
        return res.status(200).json({ statusCode: 200, data });
    } catch(error) {
        if(error.message.trim().toLowerCase().includes('not_found'))
            return res.status(404).json({
                error: error.message,
                statusCode: 404,
            });
        else if(error.message.trim().toLowerCase().includes('bad_request')) 
            return res.status(400).json({
                error: error.message,
                statusCode: 400,
            });
        return res.status(500).json({
            error,
            statusCode: 500
        });
    }
}
