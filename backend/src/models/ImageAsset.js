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

ImageAsset.belongsTo(Media, { as: 'media', foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Media.hasMany(ImageAsset, { as: 'imageAssets', foreignKey: { allowNull: false } });

export default ImageAsset;
