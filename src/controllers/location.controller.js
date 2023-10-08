import { Location, LocationTimesheet } from "../database/models/index.js";

export const getLocationById = async (req, res) => {
    try {
        const id = +req.params.id;
        
        if(isNaN(id)) throw new Error('bad_request: Invalid ID');
    
        const { dataValues: location } = await Location.findByPk(id);
        if(!location) throw new Error('not_found: Location Not Found');

        const lastEntry = await LocationTimesheet.findOne({
            where: { locationId: id },
            order: [ ['startTime', 'desc'] ]
        });

        const data = {
            ...location,
            inCount: lastEntry?.inCount || 0,
            outCount: lastEntry?.outCount || 0,
            totalCount: lastEntry?.inCount - lastEntry?.outCount || 0,
        };
        return res.status(200).json({ statusCode: 200, data });
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

export const increamentCount = async (req, res) => {
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
        
        if(isNaN(id)) throw new Error('bad_request: Invalid ID');
    
        const { dataValues: location } = await Location.findByPk(id);
        if(!location) throw new Error('not_found: Location Not Found');

        const timesheet = await LocationTimesheet.findAll({
            where: { locationId: id },
            order: [ ['startTime', 'desc'] ]
        });

        const data = { 
            ...location, 
            timesheet: timesheet.map((interval) => {
                return {
                    startTime: interval.startTime,
                    endTime: interval.endTime,
                    inCount: interval.inCount,
                    outCount: interval.outCount,
                    totalCount: interval.inCount - interval.outCount,
                }
            })
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