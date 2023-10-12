import { DataTypes } from 'sequelize';

const locationTimesheetModel = (sequelize) => {
    sequelize.define('LocationTimesheet', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        startTime: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        endTime: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        inCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        outCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        totalCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        locationId: {
            type: DataTypes.INTEGER,
            references: {
                model: sequelize.models.Location,
                key: 'id',
            }
        },
    }, {
        tableName: 'location_timesheets',
        timestamps: false,
    });
}

export { locationTimesheetModel };
