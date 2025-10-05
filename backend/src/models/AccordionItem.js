import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import Accordion from './Accordion.js';

class AccordionItem extends Model {}

AccordionItem.init(
  {
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contenido: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    color: {
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
    modelName: 'AccordionItem',
    tableName: 'accordion_items',
  },
);

const accordionForeignKey = { name: 'accordionId', allowNull: false };
AccordionItem.belongsTo(Accordion, {
  as: 'accordion',
  foreignKey: accordionForeignKey,
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Accordion.hasMany(AccordionItem, {
  as: 'items',
  foreignKey: accordionForeignKey,
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

export default AccordionItem;
