import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import Media from './Media.js';

class Document extends Model {}

Document.init(
  {
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Document',
    tableName: 'documents',
  },
);

const mediaForeignKey = { name: 'mediaId', allowNull: false };
Document.belongsTo(Media, {
  as: 'media',
  foreignKey: mediaForeignKey,
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Media.hasMany(Document, {
  as: 'documents',
  foreignKey: mediaForeignKey,
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

export default Document;
