import User from './user.js';
import Company from './company.js';
import History from './history.js';
import RefreshToken from './refreshToken.js';

User.hasMany(Company, { foreignKey: 'ownerId', as: 'companies' });
Company.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

User.hasMany(History, { foreignKey: 'userId', as: 'histories' });
History.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens' });
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'userRef' });


export { User, Company, History, RefreshToken }; 