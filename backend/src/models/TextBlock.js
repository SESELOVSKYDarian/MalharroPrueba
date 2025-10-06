import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class TextBlock extends Model {}

TextBlock.init(
  {
    textKey: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    contenido: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'TextBlock',
    tableName: 'text_blocks',
  },
);

export default TextBlock;
