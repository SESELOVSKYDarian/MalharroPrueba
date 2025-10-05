import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import Role from './Role.js';

class User extends Model {}

User.init(
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
  },
);

User.belongsTo(Role, { as: 'role', foreignKey: { allowNull: false }, onDelete: 'RESTRICT' });
Role.hasMany(User, { as: 'users', foreignKey: { allowNull: false } });

export default User;
