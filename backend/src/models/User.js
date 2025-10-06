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

const foreignKey = { name: 'roleId', allowNull: false };

User.belongsTo(Role, {
  as: 'role',
  foreignKey,
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

Role.hasMany(User, {
  as: 'users',
  foreignKey,
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

export default User;
