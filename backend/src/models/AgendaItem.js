import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import Media from './Media.js';

class AgendaItem extends Model {}

AgendaItem.init(
  {
    tituloActividad: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contenidoActividad: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fecha: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'AgendaItem',
    tableName: 'agenda_items',
  },
);

AgendaItem.belongsTo(Media, { as: 'media', foreignKey: { allowNull: false }, onDelete: 'SET NULL' });
Media.hasMany(AgendaItem, { as: 'agendaItems', foreignKey: { allowNull: false } });

export default AgendaItem;
