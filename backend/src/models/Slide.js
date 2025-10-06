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

const sliderForeignKey = { name: 'sliderId', allowNull: false };
Slide.belongsTo(Slider, {
  as: 'slider',
  foreignKey: sliderForeignKey,
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Slider.hasMany(Slide, {
  as: 'slides',
  foreignKey: sliderForeignKey,
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

const mediaForeignKey = { name: 'mediaId', allowNull: false };
Slide.belongsTo(Media, {
  as: 'media',
  foreignKey: mediaForeignKey,
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Media.hasMany(Slide, {
  as: 'slides',
  foreignKey: mediaForeignKey,
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

export default Slide;
