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

Document.belongsTo(Media, { as: 'media', foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Media.hasMany(Document, { as: 'documents', foreignKey: { allowNull: false } });

export default Document;
