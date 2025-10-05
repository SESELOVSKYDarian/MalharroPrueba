import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import Slider from './Slider.js';
import Media from './Media.js';

class Slide extends Model {}

Slide.init(
  {
    headline: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ctaLabel: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ctaUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'Slide',
    tableName: 'slides',
  },
);

Slide.belongsTo(Slider, { as: 'slider', foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Slider.hasMany(Slide, { as: 'slides', foreignKey: { allowNull: false } });

Slide.belongsTo(Media, { as: 'media', foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Media.hasMany(Slide, { as: 'slides', foreignKey: { allowNull: false } });

export default Slide;
