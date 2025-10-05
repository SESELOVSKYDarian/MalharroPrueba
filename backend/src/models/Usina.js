import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import Media from './Media.js';

class Usina extends Model {}

Usina.init(
  {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    carrera: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    link: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Usina',
    tableName: 'usinas',
  },
);

const mediaForeignKey = { name: 'mediaId', allowNull: true };
Usina.belongsTo(Media, {
  as: 'media',
  foreignKey: mediaForeignKey,
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
});
Media.hasMany(Usina, {
  as: 'usinas',
  foreignKey: mediaForeignKey,
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
});

export default Usina;
