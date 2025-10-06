import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Slider extends Model {}

Slider.init(
  {
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Slider',
    tableName: 'sliders',
  },
);

export default Slider;
