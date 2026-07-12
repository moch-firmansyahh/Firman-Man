import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server FirmanMan backend berjalan di http://localhost:${PORT}`);
});
