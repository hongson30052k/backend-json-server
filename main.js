import jsonServer from "json-server";
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

// Set default middlewares (logger, static, cors, and no-cache)
server.use(middlewares);

// Add custom routes before JSON Server router
server.get("/echo", (req, res) => {
  res.jsonp(req.query);
});

server.use(jsonServer.bodyParser);

// Thêm createdAt khi POST
server.use((req, res, next) => {
  if (req.method === "POST") {
    req.body.createdAt = Date.now();
  }
  next();
});

// Xử lý PUT để cập nhật thông tin giỏ hàng
server.put("/cart", (req, res) => {
  const { productId } = req.query; // Lấy productId từ query
  const { quantity } = req.body; // Lấy quantity (hoặc thông tin khác) từ body request

  if (!productId) {
    return res.status(400).json({ error: "productId is required" });
  }

  if (!quantity) {
    return res.status(400).json({ error: "quantity is required" });
  }

  const db = router.db;
  const cart = db.get("cart").value(); // Giả sử giỏ hàng của bạn lưu trữ trong "cart"

  // Tìm sản phẩm trong giỏ hàng
  const cartItemIndex = cart.findIndex((item) => item.productId === productId);

  if (cartItemIndex === -1) {
    return res.status(404).json({ error: "Product not found in cart" });
  }

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  db.get("cart")
    .get(cartItemIndex)
    .assign({ quantity }) // Hoặc có thể cập nhật các thuộc tính khác như giá, tổng tiền...
    .write();

  res.status(200).json({
    message: `Cart updated successfully for productId ${productId}`,
    cart: db.get("cart").value(), // Trả về giỏ hàng đã được cập nhật
  });
});

// Xử lý DELETE cho sản phẩm
server.delete("/products", (req, res) => {
  const { productId } = req.query;
  if (!productId) {
    return res.status(400).json({ error: "productId is required" });
  }
  const db = router.db;
  const products = db.get("products").value();

  const productIndex = products.findIndex(
    (product) => product.productId === productId
  );

  if (productIndex === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  db.get("products").remove({ productId }).write();

  res.status(200).json({
    message: `Product with productId ${productId} deleted successfully`,
  });
});

// Xử lý DELETE cho sản phẩm trong giỏ hàng
server.delete("/cart", (req, res) => {
  const { productId } = req.query;
  if (!productId) {
    return res.status(400).json({ error: "productId is required" });
  }
  const db = router.db;
  const cart = db.get("cart").value();

  const cartIndex = cart.findIndex((item) => item.productId === productId);

  if (cartIndex === -1) {
    return res.status(404).json({ error: "Product not found in cart" });
  }

  db.get("cart").remove({ productId }).write();

  res.status(200).json({
    message: `Product with productId ${productId} deleted from cart successfully`,
  });
});

// Chạy router JSON Server
server.use(router);

// Lắng nghe trên cổng 5000
server.listen(5000, () => {
  console.log("JSON Server is running on http://localhost:5000");
});
