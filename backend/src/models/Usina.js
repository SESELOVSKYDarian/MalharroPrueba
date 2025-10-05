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

Usina.belongsTo(Media, { as: 'media', foreignKey: { allowNull: false }, onDelete: 'SET NULL' });
Media.hasMany(Usina, { as: 'usinas', foreignKey: { allowNull: false } });

export default Usina;
