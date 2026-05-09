package com.ecommerce.server.config;

import com.ecommerce.server.dto.request.*;
import com.ecommerce.server.dto.response.CategoryResponse;
import com.ecommerce.server.dto.response.ProductResponse;
import com.ecommerce.server.models.*;
import com.ecommerce.server.models.enums.*;
import com.ecommerce.server.repository.*;
import com.ecommerce.server.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.ecommerce.server.models.enums.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final AdminCategoryService    adminCategoryService;
    private final AdminBrandService       adminBrandService;
    private final AdminProductTypeService adminProductTypeService;
    private final AdminProductService     adminProductService;
    private final ProductRepository       productRepository;
    private final ProductImageRepository  productImageRepository;
    private final UserRepository          userRepository;
    private final ReviewRepository        reviewRepository;
    private final AppReviewRepository     appReviewRepository;
    private final OrderRepository         orderRepository;
    private final OrderItemRepository     orderItemRepository;
    private final PasswordEncoder         passwordEncoder;

    private static final Size[] ALL_SIZES = {
        Size.XXS, Size.XS, Size.S, Size.M, Size.L, Size.XL, Size.XXL, Size.XXXL, Size.XXXXL
    };

    private static final String[][] REVIEW_DATA = {
        // {comment, rating}
        {"Excellent quality, exactly as described. Very happy with my purchase!", "5"},
        {"Great fit and super comfortable. Will definitely order again.", "5"},
        {"Love the material, very durable and looks great.", "5"},
        {"Perfect product! Highly recommend to everyone.", "5"},
        {"Amazing value for the price. Exceeded my expectations.", "5"},
        {"Very good quality. The fabric feels premium.", "4"},
        {"Nice product overall. Sizing is accurate.", "4"},
        {"Good purchase, arrived quickly and looks as pictured.", "4"},
        {"Pretty happy with this. Comfortable and stylish.", "4"},
        {"Solid quality, would buy again.", "4"},
        {"Decent product. Nothing special but does the job.", "3"},
        {"Average quality. Expected a bit more for the price.", "3"},
        {"It's okay. Sizing runs a bit small, order one size up.", "3"},
        {"Not bad, but the color is slightly different from the photos.", "3"},
        {"Material feels a bit thin but the style is nice.", "2"},
        {"Disappointed with the stitching quality. Not worth the price.", "2"},
        {"Sizing is way off. Had to return it.", "1"},
    };

    @Override
    public void run(String... args) {
        if (productRepository.count() == 0) {
            System.out.println("🚀 Initializing database with mock data...");

        // ── Categories ───────────────────────────────────────────────────────
        Long men   = cat("men",   "Men's clothing collection");
        Long women = cat("women", "Women's clothing collection");
        Long kids  = cat("kids",  "Kids' clothing collection");

        // ── Brands ───────────────────────────────────────────────────────────
        Long calvin  = brand("Calvin Klein");
        Long zara    = brand("Zara");
        Long nike    = brand("Nike");
        Long levis   = brand("Levi's");
        Long tommy   = brand("Tommy Hilfiger");
        Long ralph   = brand("Ralph Lauren");
        Long hm      = brand("H&M");
        Long gucci   = brand("Gucci");
        Long prada   = brand("Prada");
        Long versace = brand("Versace");

        // ── Product Types ────────────────────────────────────────────────────
        Long tshirt  = type("T-Shirt");
        Long jeans   = type("Jeans");
        Long shirt   = type("Shirt");
        Long polo    = type("Polo");
        Long hoodie  = type("Hoodie");
        Long shorts  = type("Shorts");
        Long blazer  = type("Blazer");

        // ── MEN: T-Shirts, Jeans, Shirts, Polo, Hoodies, Shorts, Blazers ─────

        // T-Shirts
        product("Classic White Tee",        "Essential everyday t-shirt",    men, calvin, 30,  50,  tshirt, DressStyle.CASUAL, Color.WHITE, Color.BLACK, Color.GRAY);
        product("Graphic Print Tee",         "Bold graphic print",            men, nike,   35,  55,  tshirt, DressStyle.CASUAL, Color.BLACK, Color.WHITE);
        product("Striped Tee",               "Classic striped design",        men, hm,     25,  40,  tshirt, DressStyle.CASUAL, Color.BLUE,  Color.WHITE, Color.BLACK);
        product("Oversized Tee",             "Relaxed oversized fit",         men, zara,   30,  50,  tshirt, DressStyle.CASUAL, Color.BLACK, Color.GRAY);
        product("Premium Cotton Tee",        "Soft premium quality",          men, ralph,  45,  70,  tshirt, DressStyle.CASUAL, Color.WHITE, Color.NAVY, Color.BLACK);
        product("Vintage Band Tee",          "Retro band graphic",            men, zara,   45,  70,  tshirt, DressStyle.CASUAL, Color.BLACK, Color.GRAY);
        product("Gym Tank Top",              "Breathable gym tank",           men, nike,   30,  50,  tshirt, DressStyle.GYM,    Color.BLACK, Color.BLUE);

        // Jeans
        product("Classic Blue Jeans",        "Timeless denim essential",      men, levis,  120, 160, jeans,  DressStyle.CASUAL, Color.BLUE,  Color.BLACK);
        product("Slim Fit Denim",            "Modern slim silhouette",        men, calvin, 95,  130, jeans,  DressStyle.CASUAL, Color.BLUE,  Color.BLACK);
        product("Distressed Jeans",          "Edgy distressed style",         men, levis,  140, 190, jeans,  DressStyle.CASUAL, Color.BLUE,  Color.BLACK);
        product("Relaxed Fit Denim",         "Comfortable relaxed fit",       men, levis,  110, 150, jeans,  DressStyle.CASUAL, Color.BLUE,  Color.GRAY);
        product("Skinny Stretch Jeans",      "Ultimate stretch comfort",      men, zara,   95,  135, jeans,  DressStyle.CASUAL, Color.BLUE,  Color.BLACK);
        product("Raw Denim",                 "Untreated raw denim",           men, levis,  130, 180, jeans,  DressStyle.CASUAL, Color.BLUE);

        // Shirts
        product("Oxford Button Shirt",       "Classic oxford cloth",          men, prada,  150, 200, shirt,  DressStyle.FORMAL, Color.WHITE, Color.BLUE);
        product("Slim Fit Dress Shirt",      "Modern slim fit",               men, gucci,  140, 180, shirt,  DressStyle.FORMAL, Color.WHITE, Color.BLACK, Color.NAVY);
        product("Casual Linen Shirt",        "Light breathable linen",        men, versace,110, 145, shirt,  DressStyle.CASUAL, Color.WHITE, Color.BLUE);
        product("Flannel Check Shirt",       "Warm flannel fabric",           men, levis,  70,  100, shirt,  DressStyle.CASUAL, Color.RED,   Color.BLUE);
        product("Denim Shirt",               "Casual denim style",            men, levis,  80,  115, shirt,  DressStyle.CASUAL, Color.BLUE,  Color.BLACK);
        product("Dress Shirt White",         "Classic white formal",          men, tommy,  85,  120, shirt,  DressStyle.FORMAL, Color.WHITE);

        // Polo
        product("Classic Polo",              "Timeless polo shirt",           men, ralph,  85,  120, polo,   DressStyle.CASUAL, Color.WHITE, Color.NAVY, Color.RED);
        product("Slim Fit Polo",             "Modern slim silhouette",        men, tommy,  75,  110, polo,   DressStyle.CASUAL, Color.WHITE, Color.BLUE, Color.BLACK);
        product("Pique Polo",                "Classic pique texture",         men, calvin, 80,  115, polo,   DressStyle.CASUAL, Color.WHITE, Color.BLACK);
        product("Sport Polo",                "Performance polo shirt",        men, nike,   65,  95,  polo,   DressStyle.GYM,    Color.BLACK, Color.BLUE, Color.WHITE);
        product("Vintage Polo",              "Retro vintage style",           men, gucci,  130, 170, polo,   DressStyle.CASUAL, Color.WHITE, Color.BLUE, Color.RED);

        // Hoodies
        product("Classic Zip Hoodie",        "Essential zip-up hoodie",       men, calvin, 95,  140, hoodie, DressStyle.CASUAL, Color.BLACK, Color.GRAY, Color.BLUE);
        product("Tech Fleece Hoodie",        "Advanced fleece technology",    men, nike,   110, 160, hoodie, DressStyle.GYM,    Color.BLACK, Color.GRAY, Color.BLUE);
        product("Oversized Hoodie",          "Relaxed oversized fit",         men, hm,     55,  85,  hoodie, DressStyle.CASUAL, Color.BLACK, Color.GRAY);
        product("Pullover Hoodie",           "Classic pullover style",        men, ralph,  90,  130, hoodie, DressStyle.CASUAL, Color.NAVY,  Color.GRAY, Color.BLACK);

        // Shorts
        product("Running Shorts",            "Lightweight running shorts",    men, nike,   45,  70,  shorts, DressStyle.GYM,    Color.BLACK, Color.BLUE);
        product("Chino Shorts",              "Smart casual chino shorts",     men, tommy,  55,  85,  shorts, DressStyle.CASUAL, Color.BROWN, Color.BLUE, Color.BLACK);
        product("Denim Shorts",              "Classic denim cut-offs",        men, levis,  60,  90,  shorts, DressStyle.CASUAL, Color.BLUE,  Color.BLACK);
        product("Swim Shorts",               "Quick-dry swim shorts",         men, calvin, 50,  75,  shorts, DressStyle.CASUAL, Color.BLUE,  Color.BLACK, Color.RED);
        product("Gym Shorts",                "Lightweight gym shorts",        men, hm,     30,  50,  shorts, DressStyle.GYM,    Color.GRAY,  Color.BLACK);

        // Blazers
        product("Business Blazer",           "Professional business blazer",  men, prada,  250, 350, blazer, DressStyle.FORMAL, Color.BLACK, Color.GRAY);
        product("Casual Blazer",             "Smart casual blazer",           men, tommy,  180, 250, blazer, DressStyle.CASUAL, Color.NAVY,  Color.BLACK);
        product("Slim Fit Blazer",           "Modern slim cut",               men, gucci,  220, 300, blazer, DressStyle.FORMAL, Color.BLACK, Color.GRAY);

        // ── WOMEN: T-Shirts, Jeans, Hoodies ──────────────────────────────────

        // T-Shirts
        product("Women's Basic Tee",         "Essential everyday tee",        women, hm,    25,  40,  tshirt, DressStyle.CASUAL, Color.WHITE, Color.BLACK, Color.PINK);
        product("Women's Crop Tee",          "Trendy crop silhouette",        women, zara,  30,  50,  tshirt, DressStyle.CASUAL, Color.WHITE, Color.BLACK);
        product("Women's Graphic Tee",       "Bold graphic print",            women, ralph, 45,  70,  tshirt, DressStyle.CASUAL, Color.WHITE, Color.BLACK);
        product("Women's Oversized Tee",     "Relaxed oversized fit",         women, hm,    30,  50,  tshirt, DressStyle.CASUAL, Color.GRAY,  Color.BLACK, Color.PINK);
        product("Women's Fitted Tee",        "Flattering fitted cut",         women, calvin,40,  65,  tshirt, DressStyle.CASUAL, Color.WHITE, Color.BLACK, Color.PINK);
        product("Women's Gym Tee",           "Performance gym tee",           women, nike,  35,  55,  tshirt, DressStyle.GYM,    Color.BLACK, Color.WHITE);

        // Jeans
        product("Women's Skinny Jeans",      "Classic skinny denim",          women, levis, 115, 160, jeans,  DressStyle.CASUAL, Color.BLUE,  Color.BLACK);
        product("Women's Flare Jeans",       "Trendy flare silhouette",       women, levis, 105, 145, jeans,  DressStyle.CASUAL, Color.BLUE,  Color.BLACK);
        product("Women's High Waist Jeans",  "High waist design",             women, calvin,120, 160, jeans,  DressStyle.CASUAL, Color.BLUE,  Color.GRAY);
        product("Women's Boyfriend Jeans",   "Relaxed boyfriend cut",         women, levis, 110, 150, jeans,  DressStyle.CASUAL, Color.BLUE,  Color.BLACK);
        product("Women's Slim Jeans",        "Sleek slim fit",                women, zara,  90,  130, jeans,  DressStyle.CASUAL, Color.BLUE,  Color.BLACK);

        // Hoodies
        product("Women's Zip Hoodie",        "Stylish zip hoodie",            women, calvin,90,  130, hoodie, DressStyle.CASUAL, Color.PINK,  Color.GRAY, Color.BLACK);
        product("Women's Pullover Hoodie",   "Cozy pullover style",           women, ralph, 85,  125, hoodie, DressStyle.CASUAL, Color.GRAY,  Color.PINK, Color.WHITE);
        product("Women's Cropped Hoodie",    "Trendy cropped hoodie",         women, zara,  65,  95,  hoodie, DressStyle.CASUAL, Color.PINK,  Color.BLACK);
        product("Women's Gym Hoodie",        "Performance gym hoodie",        women, nike,  80,  120, hoodie, DressStyle.GYM,    Color.BLACK, Color.GRAY);

        // ── KIDS: All types ──────────────────────────────────────────────────

        product("Kids Graphic Tee",          "Fun graphic for children",      kids, hm,    25, 40,  tshirt, DressStyle.CASUAL, Color.BLUE,  Color.RED,  Color.YELLOW);
        product("Kids Sport Tee",            "Active sports shirt",           kids, nike,  35, 55,  tshirt, DressStyle.GYM,    Color.BLUE,  Color.RED);
        product("Kids Classic Jeans",        "Durable kid jeans",             kids, levis, 50, 80,  jeans,  DressStyle.CASUAL, Color.BLUE,  Color.BLACK);
        product("Kids Slim Jeans",           "Slim fit kids jeans",           kids, zara,  45, 70,  jeans,  DressStyle.CASUAL, Color.BLUE,  Color.BLACK);
        product("Kids Polo Shirt",           "Classic kids polo",             kids, ralph, 45, 70,  polo,   DressStyle.CASUAL, Color.WHITE, Color.BLUE);
        product("Kids Sport Polo",           "Active sport polo",             kids, nike,  40, 65,  polo,   DressStyle.GYM,    Color.RED,   Color.BLUE);
        product("Kids Button Shirt",         "Smart kids shirt",              kids, tommy, 40, 65,  shirt,  DressStyle.FORMAL, Color.WHITE, Color.BLUE);
        product("Kids Casual Shirt",         "Everyday kids shirt",           kids, hm,    30, 50,  shirt,  DressStyle.CASUAL, Color.BLUE,  Color.RED);
        product("Kids Zip Hoodie",           "Cozy zip hoodie",               kids, hm,    40, 65,  hoodie, DressStyle.CASUAL, Color.BLUE,  Color.RED);
        product("Kids Pullover Hoodie",      "Warm pullover hoodie",          kids, nike,  45, 70,  hoodie, DressStyle.GYM,    Color.BLACK, Color.BLUE);
        product("Kids Shorts",               "Comfortable play shorts",       kids, hm,    25, 40,  shorts, DressStyle.CASUAL, Color.BLUE,  Color.BLACK);
        product("Kids Sport Shorts",         "Active sport shorts",           kids, nike,  30, 50,  shorts, DressStyle.GYM,    Color.BLACK, Color.BLUE);
        product("Kids Blazer",               "Smart kids blazer",             kids, tommy, 80, 120, blazer, DressStyle.FORMAL, Color.NAVY,  Color.BLACK);

            System.out.println("✅ Database initialized successfully!");
        } else {
            System.out.println("✅ Database already has products. Skipping product initialization.");
        }

        if (reviewRepository.count() == 0) {
            System.out.println("🚀 Seeding reviews...");
            seedReviews();
        } else {
            System.out.println("✅ Database already has reviews. Skipping review initialization.");
        }

        if (appReviewRepository.count() == 0) {
            System.out.println("🚀 Seeding app reviews...");
            seedAppReviews();
        } else {
            System.out.println("✅ Database already has app reviews. Skipping app review initialization.");
        }

        if (orderRepository.count() == 0) {
            System.out.println("🚀 Seeding orders...");
            seedOrders();
        } else {
            System.out.println("✅ Database already has orders. Skipping order initialization.");
        }
    }

    // ── Review seeding ───────────────────────────────────────────────────────

    private void seedReviews() {
        List<User> reviewers = createTestReviewers();
        List<Product> products = productRepository.findAll();

        int totalReviews = 0;
        for (Product product : products) {
            int numReviews = 3 + (int) (product.getId() % 3);
            for (int i = 0; i < numReviews; i++) {
                User reviewer = reviewers.get((int) ((product.getId() + i) % reviewers.size()));
                int dataIdx = (int) ((product.getId() * 7 + i * 3) % REVIEW_DATA.length);
                int rating = Integer.parseInt(REVIEW_DATA[dataIdx][1]);
                String comment = REVIEW_DATA[dataIdx][0];

                Review review = Review.builder()
                        .product(product)
                        .user(reviewer)
                        .rating(rating)
                        .comment(comment)
                        .createdAt(LocalDateTime.now().minusDays(product.getId() % 90 + (long) i * 7))
                        .build();
                reviewRepository.save(review);
                totalReviews++;
            }

            Double avg = reviewRepository.findAverageRatingByProductId(product.getId());
            long count = reviewRepository.findByProductIdOrderByCreatedAtDesc(product.getId()).size();
            product.setRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
            product.setReviewCount((int) count);
            productRepository.save(product);
        }

        System.out.println("✅ Seeded " + totalReviews + " reviews for " + products.size() + " products!");
    }

    private List<User> createTestReviewers() {
        String[][] data = {
            {"Alice",  "Johnson",  "alice.johnson@testshop.com"},
            {"Bob",    "Smith",    "bob.smith@testshop.com"},
            {"Carol",  "Williams", "carol.williams@testshop.com"},
            {"David",  "Brown",    "david.brown@testshop.com"},
            {"Emma",   "Davis",    "emma.davis@testshop.com"},
        };

        List<User> users = new java.util.ArrayList<>();
        for (String[] d : data) {
            User user = userRepository.findByEmail(d[2]).orElseGet(() ->
                    userRepository.save(User.builder()
                            .firstName(d[0])
                            .lastName(d[1])
                            .email(d[2])
                            .passwordHash(passwordEncoder.encode("testpassword123"))
                            .build()));
            users.add(user);
        }
        return users;
    }

    private void seedOrders() {
        List<User> users = createTestReviewers();
        List<Product> allProducts = productRepository.findAllWithVariants();
        if (allProducts.isEmpty()) return;

        // Πρώτα 8 products = top selling (εμφανίζονται σε πολλές παραγγελίες)
        List<Product> topProducts = allProducts.subList(0, Math.min(8, allProducts.size()));
        List<Product> otherProducts = allProducts.subList(Math.min(8, allProducts.size()), allProducts.size());

        int orderSeq = 0;

        // 4 παραγγελίες ανά user — κυρίως top products
        for (int u = 0; u < users.size(); u++) {
            User user = users.get(u);
            for (int o = 0; o < 4; o++) {
                List<Product> items = new ArrayList<>();
                items.add(topProducts.get((u * 4 + o) % topProducts.size()));
                items.add(topProducts.get((u * 4 + o + 2) % topProducts.size()));
                if (o % 2 == 0 && !otherProducts.isEmpty()) {
                    items.add(otherProducts.get((u + o) % otherProducts.size()));
                }
                createMockOrder(user, items, ++orderSeq, o % 2 == 0 ? 2 : 1);
            }
        }

        // Επιπλέον παραγγελίες μόνο για top products (για να ξεχωρίζουν)
        for (int i = 0; i < topProducts.size(); i++) {
            for (int r = 0; r < 3; r++) {
                User user = users.get((i + r) % users.size());
                createMockOrder(user, List.of(topProducts.get(i)), ++orderSeq, 3);
            }
        }

        System.out.println("✅ Seeded " + orderSeq + " orders!");
    }

    private void createMockOrder(User user, List<Product> products, int seq, int quantity) {
        BigDecimal subtotal = products.stream()
                .map(p -> p.getPrice().multiply(BigDecimal.valueOf(quantity)))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal tax      = subtotal.multiply(BigDecimal.valueOf(0.10));
        BigDecimal shipping = BigDecimal.valueOf(5.00);
        BigDecimal total    = subtotal.add(tax).add(shipping);

        Order order = orderRepository.save(Order.builder()
                .orderNumber("ORD-SEED-" + String.format("%04d", seq))
                .user(user)
                .status(OrderStatus.DELIVERED)
                .subtotal(subtotal)
                .tax(tax)
                .shippingFee(shipping)
                .total(total)
                .paymentMethod("CARD")
                .createdAt(LocalDateTime.now().minusDays((long) seq * 2))
                .build());

        for (Product product : products) {
            if (product.getVariants().isEmpty()) continue;
            ProductVariant variant = product.getVariants().get(0);

            orderItemRepository.save(OrderItem.builder()
                    .order(order)
                    .product(product)
                    .variant(variant)
                    .productName(product.getName())
                    .priceAtPurchase(product.getPrice())
                    .selectedColor(variant.getColor().toString())
                    .selectedSize(variant.getSize().toString())
                    .quantity(quantity)
                    .subtotal(product.getPrice().multiply(BigDecimal.valueOf(quantity)))
                    .build());
        }
    }

    private void seedAppReviews() {
        List<User> users = createTestReviewers();

        Object[][] data = {
            {users.get(0), 5, "Absolutely love this shop! The quality is outstanding and delivery was super fast."},
            {users.get(1), 5, "Best online shopping experience I've had. Great selection and the sizing guide is spot on."},
            {users.get(2), 5, "Amazing customer service and the clothes are exactly as pictured. Will definitely shop again!"},
            {users.get(3), 4, "Really happy with my order. The fabrics feel premium and the prices are fair."},
            {users.get(4), 5, "Found exactly what I was looking for. Fast shipping and beautiful packaging too."},
            {users.get(0), 4, "Great variety of styles and brands. The filter options make it easy to find what you need."},
            {users.get(1), 5, "Ordered twice already and both times were perfect. Highly recommend!"},
            {users.get(2), 4, "Good quality products. A few items were slightly different in color but overall very satisfied."},
            {users.get(3), 5, "The checkout process is smooth and my order arrived earlier than expected. Very impressed!"},
            {users.get(4), 4, "Love the range of brands available. Found items I couldn't find anywhere else locally."},
            {users.get(0), 5, "Everything from browsing to delivery was seamless. The clothes fit perfectly too!"},
            {users.get(1), 4, "Really good value for money. The quality matches the price point exactly."},
            {users.get(2), 5, "My go-to shop for clothes now. Always find something I like and the deals are great."},
            {users.get(3), 4, "Solid experience overall. The product photos are accurate and sizing is consistent."},
            {users.get(4), 5, "Incredible selection and super easy to navigate. Customer support was helpful too."},
        };

        for (Object[] d : data) {
            appReviewRepository.save(AppReview.builder()
                    .user((User) d[0])
                    .rating((Integer) d[1])
                    .comment((String) d[2])
                    .approved(true)
                    .createdAt(LocalDateTime.now().minusDays((long) (Math.random() * 60)))
                    .build());
        }

        System.out.println("✅ Seeded " + data.length + " app reviews!");
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Long cat(String name, String description) {
        CategoryResponse r = adminCategoryService.createCategory(
                new CategoryRequest(name, description,
                        "https://picsum.photos/150/150.webp?random=" + Math.abs(name.hashCode())));
        return r.id();
    }

    private Long brand(String name) {
        return adminBrandService.createBrand(
                new BrandRequest(name,
                        "https://picsum.photos/100/100.webp?random=" + Math.abs(name.hashCode())))
                .getId();
    }

    private Long type(String name) {
        return adminProductTypeService.createProductType(new ProductTypeRequest(name)).getId();
    }

    private void product(String name, String description, Long categoryId, Long brandId,
                         int price, int originalPrice, Long productTypeId,
                         DressStyle dressStyle, Color... colors) {

        int discountPercent = (int) Math.round((originalPrice - price) * 100.0 / originalPrice);

        ProductResponse p = adminProductService.createProduct(new ProductRequest(
                name, description, categoryId, brandId, productTypeId, dressStyle,
                BigDecimal.valueOf(price), BigDecimal.valueOf(originalPrice), discountPercent
        ));

        ProductImage image = new ProductImage();
        image.setProduct(productRepository.getReferenceById(p.id()));
        image.setImageUrl("https://picsum.photos/400/500.webp?random=" + p.id());
        productImageRepository.save(image);

        for (Color color : colors) {
            for (Size size : ALL_SIZES) {
                String sku = String.format("SKU-%d-%s-%s-%s",
                        p.id(),
                        color.name().substring(0, 3),
                        size.name(),
                        UUID.randomUUID().toString().substring(0, 6).toUpperCase());
                adminProductService.addVariant(p.id(), new ProductVariantRequest(
                        color, size, (int) (Math.random() * 50) + 10, sku
                ));
            }
        }
    }
}