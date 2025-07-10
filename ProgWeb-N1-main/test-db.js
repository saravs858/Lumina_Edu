const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔍 Iniciando teste de conexão com MongoDB...');
console.log('📌 URI usada:', process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lumina-edu');

// Configuração otimizada para Mongoose 8+
const connectionOptions = {
  serverSelectionTimeoutMS: 5000, // 5 segundos para seleção de servidor
  socketTimeoutMS: 45000,        // 45 segundos para operações
  maxPoolSize: 10                // Número máximo de conexões
};

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lumina-edu', connectionOptions)
  .then(() => {
    console.log('✅ Conexão bem-sucedida!');
    console.log('📊 Status da conexão:');
    console.log('- Host:', mongoose.connection.host);
    console.log('- Porta:', mongoose.connection.port);
    console.log('- Banco de dados:', mongoose.connection.name);
    
    return mongoose.connection.close();
  })
  .then(() => {
    console.log('🛑 Conexão encerrada com sucesso');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Falha na conexão:', err.message);
    console.log('\n🔧 Possíveis soluções:');
    
    if (err.message.includes('ECONNREFUSED')) {
      console.log('1. O MongoDB não está rodando - inicie o serviço:');
      console.log('   - Windows (como Admin): "net start MongoDB"');
      console.log('   - Linux/Mac: "sudo systemctl start mongod"');
    } else if (err.message.includes('ENOTFOUND')) {
      console.log('1. Verifique se a URI no arquivo .env está correta');
      console.log('2. Confira seu acesso à internet');
    } else if (err.message.includes('timed out')) {
      console.log('1. O servidor MongoDB pode estar sobrecarregado');
      console.log('2. Aumente o timeout em connectionOptions');
    }
    
    console.log('\n💡 Dica: Verifique se o MongoDB está acessível via:');
    console.log('   mongo --host localhost --port 27017');
    
    process.exit(1);
  });