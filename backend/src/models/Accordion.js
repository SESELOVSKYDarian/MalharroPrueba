import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Accordion extends Model {}

Accordion.init(
  {
    accordionKey: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Accordion',
    tableName: 'accordions',
  },
);

export default Accordion;
