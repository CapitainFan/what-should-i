module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://what-should-i-sixxx.onrender.com/api/:path*',
      },
    ];
  },
};