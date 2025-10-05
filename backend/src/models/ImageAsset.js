import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import Media from './Media.js';

class ImageAsset extends Model {}

ImageAsset.init(
  {
    imageKey: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    altText: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'ImageAsset',
    tableName: 'image_assets',
  },
);

const mediaForeignKey = { name: 'mediaId', allowNull: false };
ImageAsset.belongsTo(Media, {
  as: 'media',
  foreignKey: mediaForeignKey,
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Media.hasMany(ImageAsset, {
  as: 'imageAssets',
  foreignKey: mediaForeignKey,
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

export default ImageAsset;
