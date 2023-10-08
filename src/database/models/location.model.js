import { DataTypes, literal } from 'sequelize';

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
    }, {
        tableName: 'locations',
        timestamps: false,
    });
}

export { locationModel };