import { DataTypes } from 'sequelize';

const locationModel = (sequelize) => {
    sequelize.define('Location', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
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
        resetTimestamp: {
            type: DataTypes.BIGINT,
            allowNull: true,
        }
    }, {
        tableName: 'locations',
        timestamps: false,
    });
}

export { locationModel };
