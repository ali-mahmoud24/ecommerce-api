const categoryRoute = require('./categoryRoute');
const subcategoryRoute = require('./subcategoryRoute');
const brandRoute = require('./brandRoute');
const productRoute = require('./productRoute');
const userRoute = require('./userRoute');
const authRoute = require('./authRoute');
const reviewRoute = require('./reviewRoute');
const wishlistRoute = require('./wishlistRoute');
const addressRoute = require('./addressRoute');
const couponRoute = require('./couponRoute');
const cartRoute = require('./cartRoute');
const orderRoute = require('./orderRoute');

// Mount Routes
const mountRoutes = (app) => {
  app.get('/', (req, res) => {
    res.redirect('/api/v1');
  });
  app.get('/api/v1', (req, res) => {
    res.status(200).json({
      message: 'Welcome to the E-Commerce API v1 🚀',
      status: 'success',
      routes: {
        products: '/api/v1/products',
        categories: '/api/v1/categories',
        auth: '/api/v1/auth',
      },
    });
  });
  app.use('/api/v1/categories', categoryRoute);
  app.use('/api/v1/subcategories', subcategoryRoute);
  app.use('/api/v1/brands', brandRoute);
  app.use('/api/v1/products', productRoute);
  app.use('/api/v1/users', userRoute);
  app.use('/api/v1/auth', authRoute);
  app.use('/api/v1/reviews', reviewRoute);
  app.use('/api/v1/wishlist', wishlistRoute);
  app.use('/api/v1/addresses', addressRoute);
  app.use('/api/v1/coupons', couponRoute);
  app.use('/api/v1/cart', cartRoute);
  app.use('/api/v1/orders', orderRoute);
};

module.exports = mountRoutes;
