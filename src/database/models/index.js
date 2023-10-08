import { Sequelize } from 'sequelize';

import { dbConfig } from '../../config/index.js';
import { locationModel } from './location.model.js';
import { locationTimesheetModel } from './location-timesheet.model.js';
 
const { 
    host,
    port,
    username,
    password,
    dbName,
    dialect,
} = dbConfig;

const sequelize = new Sequelize(dbName, username, password, {
    host,
    port,
    dialect,
    dialectOptions: {
        ssl: {
            required: true,
            rejectUnauthorized: false,
        }
    }
});

try {
    await sequelize.authenticate();
    console.log("DB Connected successfully!!");
} catch (error) {
    console.log(error);
}
sequelize.sync({ alter: true });
locationModel(sequelize);
locationTimesheetModel(sequelize);

const { Location, LocationTimesheet } = sequelize.models;

Location.hasMany(LocationTimesheet, {
    foreignKey: 'locationId'
});
LocationTimesheet.belongsTo(Location, {
    foreignKey: 'locationId'
});

export { Location, LocationTimesheet };
