package com.ecommerce.server.config;

import com.ecommerce.server.models.*;
import com.ecommerce.server.models.enums.*;
import com.ecommerce.server.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductTypeRepository productTypeRepository;

    public DataInitializer(CategoryRepository categoryRepository,
                           BrandRepository brandRepository,
                           ProductRepository productRepository,
                           ProductImageRepository productImageRepository,
                           ProductVariantRepository productVariantRepository,
                           ProductTypeRepository productTypeRepository) {
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.productVariantRepository = productVariantRepository;
        this.productTypeRepository = productTypeRepository;
    }

    @Override
    public void run(String... args) {
        // Αν υπάρχουν ήδη data, μην κάνουμε τίποτα
        if (productRepository.count() > 0) {
            System.out.println("✅ Database already has products. Skipping initialization.");
            return;
        }

        if (categoryRepository.count() > 0) {
            System.out.println("✅ Database already has categories. Skipping initialization.");
            return;
        }

        System.out.println("🚀 Initializing database with mock data...");

        // 1. Δημιουργία Categories
        Category menCategory = createCategory("men", "Men's clothing collection");
        Category womenCategory = createCategory("women", "Women's clothing collection");
        Category kidsCategory = createCategory("kids", "Kids' clothing collection");
        Category accessoriesCategory = createCategory("accessories", "Fashion accessories");

        // 2. Δημιουργία Brands
        Brand calvin = createBrand("Calvin Klein");
        Brand gucci = createBrand("Gucci");
        Brand prada = createBrand("Prada");
        Brand zara = createBrand("Zara");
        Brand versace = createBrand("Versace");

        // 3. Δημιουργία Product Types
        ProductType shirt = createProductType("Shirt");
        ProductType jeans = createProductType("Jeans");
        ProductType pants = createProductType("Pants");
        ProductType hoodie = createProductType("Hoodie");
        ProductType dress = createProductType("Dress");

        // 4. Δημιουργία Products (100 products διαφορετικά)
        // MEN - SHIRTS
        createProductWithVariants("Premium Casual Shirt", "High-quality dress shirt for versatile styling", menCategory, calvin, BigDecimal.valueOf(120), BigDecimal.valueOf(150), shirt, DressStyle.CASUAL, "Black_Striped_T-shirt.png", new Color[]{Color.WHITE, Color.BLUE, Color.BLACK});
        createProductWithVariants("Cotton Blend Shirt", "Comfortable everyday shirt", menCategory, zara, BigDecimal.valueOf(85), BigDecimal.valueOf(110), shirt, DressStyle.CASUAL, "Checkered_Shirt.png", new Color[]{Color.RED, Color.BLUE, Color.WHITE});
        createProductWithVariants("Oxford Button Shirt", "Classic oxford cloth shirt", menCategory, prada, BigDecimal.valueOf(150), BigDecimal.valueOf(200), shirt, DressStyle.FORMAL, "Vertical_Striped_Shirt.png", new Color[]{Color.WHITE, Color.BLUE});
        createProductWithVariants("Slim Fit Dress Shirt", "Modern slim fit design", menCategory, gucci, BigDecimal.valueOf(140), BigDecimal.valueOf(180), shirt, DressStyle.FORMAL, "Black_Striped_T-shirt.png", new Color[]{Color.WHITE, Color.BLACK, Color.NAVY});
        createProductWithVariants("Casual Linen Shirt", "Light and breathable linen", menCategory, versace, BigDecimal.valueOf(110), BigDecimal.valueOf(145), shirt, DressStyle.CASUAL, "Checkered_Shirt.png", new Color[]{Color.WHITE, Color.BLUE});
        createProductWithVariants("Graphic Tee Collection", "Trendy graphic prints", menCategory, zara, BigDecimal.valueOf(50), BigDecimal.valueOf(75), shirt, DressStyle.CASUAL, "Courage_Graphic_T-shirt.png", new Color[]{Color.BLACK, Color.WHITE, Color.GRAY});
        createProductWithVariants("Sports Performance Shirt", "Moisture-wicking fabric", menCategory, calvin, BigDecimal.valueOf(95), BigDecimal.valueOf(130), shirt, DressStyle.SPORT, "Black_Striped_T-shirt.png", new Color[]{Color.BLACK, Color.BLUE, Color.RED});
        createProductWithVariants("Vintage Polo Shirt", "Classic polo style", menCategory, gucci, BigDecimal.valueOf(130), BigDecimal.valueOf(170), shirt, DressStyle.CASUAL, "Polo_with_Contrast_Trims.png", new Color[]{Color.WHITE, Color.BLUE, Color.RED});
        createProductWithVariants("Premium Henley", "Elegant henley neckline", menCategory, prada, BigDecimal.valueOf(105), BigDecimal.valueOf(140), shirt, DressStyle.CASUAL, "Black_Striped_T-shirt.png", new Color[]{Color.WHITE, Color.BLACK});
        createProductWithVariants("Athletic Compression Shirt", "Supportive athletic wear", menCategory, versace, BigDecimal.valueOf(85), BigDecimal.valueOf(120), shirt, DressStyle.SPORT, "Black_Striped_T-shirt.png", new Color[]{Color.BLACK, Color.BLUE});

        // MEN - JEANS
        createProductWithVariants("Classic Blue Jeans", "Timeless denim essential", menCategory, calvin, BigDecimal.valueOf(120), BigDecimal.valueOf(160), jeans, DressStyle.CASUAL, "Skinny_Fit_Jeans.png", new Color[]{Color.BLUE, Color.BLACK});
        createProductWithVariants("Slim Fit Denim", "Modern slim silhouette", menCategory, zara, BigDecimal.valueOf(95), BigDecimal.valueOf(130), jeans, DressStyle.CASUAL, "Faded_Skinny_Jeans.png", new Color[]{Color.BLUE, Color.BLACK});
        createProductWithVariants("Distressed Jeans", "Edgy distressed style", menCategory, gucci, BigDecimal.valueOf(140), BigDecimal.valueOf(190), jeans, DressStyle.CASUAL, "Skinny_Fit_Jeans.png", new Color[]{Color.BLUE, Color.BLACK});
        createProductWithVariants("Relaxed Fit Denim", "Comfortable relaxed fit", menCategory, prada, BigDecimal.valueOf(130), BigDecimal.valueOf(170), jeans, DressStyle.CASUAL, "Faded_Skinny_Jeans.png", new Color[]{Color.BLUE, Color.GRAY});
        createProductWithVariants("Slim Stretch Jeans", "Flexible stretch denim", menCategory, versace, BigDecimal.valueOf(110), BigDecimal.valueOf(150), jeans, DressStyle.CASUAL, "Skinny_Fit_Jeans.png", new Color[]{Color.BLUE, Color.BLACK, Color.WHITE});
        createProductWithVariants("Premium Denim", "High-end quality jeans", menCategory, calvin, BigDecimal.valueOf(160), BigDecimal.valueOf(210), jeans, DressStyle.FORMAL, "Faded_Skinny_Jeans.png", new Color[]{Color.BLUE, Color.BLACK});
        createProductWithVariants("Tapered Fit Jeans", "Tapered leg design", menCategory, zara, BigDecimal.valueOf(100), BigDecimal.valueOf(140), jeans, DressStyle.CASUAL, "Skinny_Fit_Jeans.png", new Color[]{Color.BLUE, Color.GRAY});
        createProductWithVariants("Raw Denim", "Untreated raw denim", menCategory, gucci, BigDecimal.valueOf(150), BigDecimal.valueOf(200), jeans, DressStyle.CASUAL, "Faded_Skinny_Jeans.png", new Color[]{Color.BLUE});
        createProductWithVariants("Skinny Stretch Jeans", "Ultimate stretch comfort", menCategory, prada, BigDecimal.valueOf(120), BigDecimal.valueOf(160), jeans, DressStyle.CASUAL, "Skinny_Fit_Jeans.png", new Color[]{Color.BLUE, Color.BLACK});
        createProductWithVariants("Vintage Wash Jeans", "Classic vintage look", menCategory, versace, BigDecimal.valueOf(125), BigDecimal.valueOf(165), jeans, DressStyle.CASUAL, "Faded_Skinny_Jeans.png", new Color[]{Color.BLUE, Color.BLACK});

        // MEN - PANTS
        createProductWithVariants("Chino Pants", "Versatile chino trousers", menCategory, calvin, BigDecimal.valueOf(90), BigDecimal.valueOf(125), pants, DressStyle.CASUAL, "Loose_Fit_Bermouda_Shorts.png", new Color[]{Color.BROWN, Color.BLUE, Color.BLACK});
        createProductWithVariants("Cargo Pants", "Utility cargo style", menCategory, zara, BigDecimal.valueOf(80), BigDecimal.valueOf(115), pants, DressStyle.CASUAL, "Loose_Fit_Bermouda_Shorts.png", new Color[]{Color.BROWN, Color.GRAY, Color.BLACK});
        createProductWithVariants("Dress Trousers", "Formal dress pants", menCategory, prada, BigDecimal.valueOf(140), BigDecimal.valueOf(190), pants, DressStyle.FORMAL, "Loose_Fit_Bermouda_Shorts.png", new Color[]{Color.BLACK, Color.GRAY});
        createProductWithVariants("Slim Fit Trousers", "Modern slim fit", menCategory, gucci, BigDecimal.valueOf(110), BigDecimal.valueOf(150), pants, DressStyle.FORMAL, "Loose_Fit_Bermouda_Shorts.png", new Color[]{Color.BLACK, Color.GRAY, Color.BROWN});
        createProductWithVariants("Casual Track Pants", "Comfortable lounge wear", menCategory, versace, BigDecimal.valueOf(75), BigDecimal.valueOf(110), pants, DressStyle.CASUAL, "Loose_Fit_Bermouda_Shorts.png", new Color[]{Color.GRAY, Color.BLACK, Color.BLUE});

        // MEN - HOODIES
        createProductWithVariants("Classic Zip Hoodie", "Essential zip-up hoodie", menCategory, calvin, BigDecimal.valueOf(95), BigDecimal.valueOf(140), hoodie, DressStyle.CASUAL, "Earth-Tone_Cloud_Wash_Hoodie.png", new Color[]{Color.BLACK, Color.GRAY, Color.BLUE});
        createProductWithVariants("Premium Cotton Hoodie", "Soft premium quality", menCategory, zara, BigDecimal.valueOf(85), BigDecimal.valueOf(125), hoodie, DressStyle.CASUAL, "Earth-Tone_Cloud_Wash_Hoodie.png", new Color[]{Color.BLACK, Color.GRAY});
        createProductWithVariants("Tech Fleece Hoodie", "Advanced fleece technology", menCategory, gucci, BigDecimal.valueOf(120), BigDecimal.valueOf(160), hoodie, DressStyle.CASUAL, "Earth-Tone_Cloud_Wash_Hoodie.png", new Color[]{Color.BLACK, Color.GRAY, Color.BLUE});
        createProductWithVariants("Oversized Hoodie", "Relaxed oversized fit", menCategory, prada, BigDecimal.valueOf(110), BigDecimal.valueOf(150), hoodie, DressStyle.CASUAL, "Earth-Tone_Cloud_Wash_Hoodie.png", new Color[]{Color.BLACK, Color.GRAY});
        createProductWithVariants("Athletic Hoodie", "Performance athletic", menCategory, versace, BigDecimal.valueOf(100), BigDecimal.valueOf(140), hoodie, DressStyle.SPORT, "Earth-Tone_Cloud_Wash_Hoodie.png", new Color[]{Color.BLACK, Color.BLUE});

        // WOMEN - SHIRTS
        createProductWithVariants("Women's Fitted Blouse", "Elegant fitted cut", womenCategory, calvin, BigDecimal.valueOf(110), BigDecimal.valueOf(150), shirt, DressStyle.FORMAL, "Courage_Graphic_T-shirt.png", new Color[]{Color.WHITE, Color.BLUE, Color.BLACK});
        createProductWithVariants("Women's Casual Top", "Comfortable casual wear", womenCategory, zara, BigDecimal.valueOf(65), BigDecimal.valueOf(95), shirt, DressStyle.CASUAL, "Courage_Graphic_T-shirt.png", new Color[]{Color.WHITE, Color.PINK, Color.BLACK});
        createProductWithVariants("Women's Silk Blouse", "Luxurious silk material", womenCategory, gucci, BigDecimal.valueOf(160), BigDecimal.valueOf(220), shirt, DressStyle.FORMAL, "Courage_Graphic_T-shirt.png", new Color[]{Color.WHITE, Color.BLACK});
        createProductWithVariants("Women's V-Neck Tee", "Flattering V-neckline", womenCategory, prada, BigDecimal.valueOf(75), BigDecimal.valueOf(110), shirt, DressStyle.CASUAL, "Courage_Graphic_T-shirt.png", new Color[]{Color.WHITE, Color.BLACK, Color.PINK});
        createProductWithVariants("Women's Oversized Shirt", "Trendy oversized silhouette", womenCategory, versace, BigDecimal.valueOf(95), BigDecimal.valueOf(130), shirt, DressStyle.CASUAL, "Courage_Graphic_T-shirt.png", new Color[]{Color.WHITE, Color.BLUE});

        // WOMEN - JEANS
        createProductWithVariants("Women's Skinny Jeans", "Classic skinny denim", womenCategory, calvin, BigDecimal.valueOf(115), BigDecimal.valueOf(160), jeans, DressStyle.CASUAL, "Faded_Skinny_Jeans.png", new Color[]{Color.BLUE, Color.BLACK});
        createProductWithVariants("Women's Flare Jeans", "Trendy flare silhouette", womenCategory, zara, BigDecimal.valueOf(105), BigDecimal.valueOf(145), jeans, DressStyle.CASUAL, "Faded_Skinny_Jeans.png", new Color[]{Color.BLUE, Color.BLACK});
        createProductWithVariants("Women's Bootcut Jeans", "Classic bootcut fit", womenCategory, gucci, BigDecimal.valueOf(130), BigDecimal.valueOf(180), jeans, DressStyle.CASUAL, "Faded_Skinny_Jeans.png", new Color[]{Color.BLUE, Color.BLACK});
        createProductWithVariants("Women's High Waist Jeans", "High waist design", womenCategory, prada, BigDecimal.valueOf(120), BigDecimal.valueOf(160), jeans, DressStyle.CASUAL, "Faded_Skinny_Jeans.png", new Color[]{Color.BLUE, Color.GRAY});
        createProductWithVariants("Women's Ripped Jeans", "Edgy ripped style", womenCategory, versace, BigDecimal.valueOf(125), BigDecimal.valueOf(170), jeans, DressStyle.CASUAL, "Faded_Skinny_Jeans.png", new Color[]{Color.BLUE, Color.BLACK});

        // WOMEN - DRESS
        createProductWithVariants("Casual Day Dress", "Perfect everyday dress", womenCategory, calvin, BigDecimal.valueOf(95), BigDecimal.valueOf(140), dress, DressStyle.CASUAL, "Courage_Graphic_T-shirt.png", new Color[]{Color.BLUE, Color.BLACK, Color.WHITE});
        createProductWithVariants("Evening Gown", "Elegant evening wear", womenCategory, gucci, BigDecimal.valueOf(250), BigDecimal.valueOf(350), dress, DressStyle.PARTY, "Courage_Graphic_T-shirt.png", new Color[]{Color.BLACK, Color.RED});
        createProductWithVariants("Cocktail Dress", "Sophisticated cocktail", womenCategory, prada, BigDecimal.valueOf(180), BigDecimal.valueOf(250), dress, DressStyle.PARTY, "Courage_Graphic_T-shirt.png", new Color[]{Color.BLACK, Color.BLUE});
        createProductWithVariants("Maxi Dress", "Flowing maxi silhouette", womenCategory, zara, BigDecimal.valueOf(85), BigDecimal.valueOf(120), dress, DressStyle.CASUAL, "Courage_Graphic_T-shirt.png", new Color[]{Color.WHITE, Color.BLUE, Color.BLACK});
        createProductWithVariants("Summer Sundress", "Light summer dress", womenCategory, versace, BigDecimal.valueOf(75), BigDecimal.valueOf(110), dress, DressStyle.CASUAL, "Courage_Graphic_T-shirt.png", new Color[]{Color.WHITE, Color.PINK});

        // WOMEN - HOODIES & PANTS
        createProductWithVariants("Women's Zip Hoodie", "Stylish zip hoodie", womenCategory, calvin, BigDecimal.valueOf(90), BigDecimal.valueOf(130), hoodie, DressStyle.CASUAL, "Earth-Tone_Cloud_Wash_Hoodie.png", new Color[]{Color.PINK, Color.GRAY, Color.BLACK});
        createProductWithVariants("Women's Sweatpants", "Comfortable sweatpants", womenCategory, zara, BigDecimal.valueOf(60), BigDecimal.valueOf(90), pants, DressStyle.CASUAL, "Loose_Fit_Bermouda_Shorts.png", new Color[]{Color.GRAY, Color.BLACK, Color.PINK});
        createProductWithVariants("Women's Yoga Pants", "Athletic yoga wear", womenCategory, gucci, BigDecimal.valueOf(95), BigDecimal.valueOf(140), pants, DressStyle.SPORT, "Loose_Fit_Bermouda_Shorts.png", new Color[]{Color.BLACK, Color.PURPLE});
        createProductWithVariants("Women's Leggings", "Versatile leggings", womenCategory, prada, BigDecimal.valueOf(75), BigDecimal.valueOf(110), pants, DressStyle.SPORT, "Loose_Fit_Bermouda_Shorts.png", new Color[]{Color.BLACK, Color.GRAY});
        createProductWithVariants("Women's Chino Pants", "Casual chino style", womenCategory, versace, BigDecimal.valueOf(85), BigDecimal.valueOf(120), pants, DressStyle.CASUAL, "Loose_Fit_Bermouda_Shorts.png", new Color[]{Color.BROWN, Color.BLACK, Color.BLUE});

        // KIDS - SHIRTS
        createProductWithVariants("Kids Graphic Tee", "Fun graphic for children", kidsCategory, zara, BigDecimal.valueOf(35), BigDecimal.valueOf(55), shirt, DressStyle.CASUAL, "Courage_Graphic_T-shirt.png", new Color[]{Color.BLUE, Color.RED, Color.YELLOW});
        createProductWithVariants("Kids Polo Shirt", "Classic kids polo", kidsCategory, calvin, BigDecimal.valueOf(45), BigDecimal.valueOf(70), shirt, DressStyle.CASUAL, "Polo_with_Contrast_Trims.png", new Color[]{Color.WHITE, Color.BLUE});
        createProductWithVariants("Kids Sport Shirt", "Active sports shirt", kidsCategory, gucci, BigDecimal.valueOf(55), BigDecimal.valueOf(85), shirt, DressStyle.SPORT, "Black_Striped_T-shirt.png", new Color[]{Color.BLUE, Color.RED});

        // KIDS - PANTS & HOODIES
        createProductWithVariants("Kids Jeans", "Durable kid jeans", kidsCategory, zara, BigDecimal.valueOf(50), BigDecimal.valueOf(80), jeans, DressStyle.CASUAL, "Faded_Skinny_Jeans.png", new Color[]{Color.BLUE, Color.BLACK});
        createProductWithVariants("Kids Hoodie", "Cozy kids hoodie", kidsCategory, calvin, BigDecimal.valueOf(55), BigDecimal.valueOf(85), hoodie, DressStyle.CASUAL, "Earth-Tone_Cloud_Wash_Hoodie.png", new Color[]{Color.BLUE, Color.RED});
        createProductWithVariants("Kids Shorts", "Comfortable kids shorts", kidsCategory, prada, BigDecimal.valueOf(35), BigDecimal.valueOf(55), pants, DressStyle.CASUAL, "Loose_Fit_Bermouda_Shorts.png", new Color[]{Color.BLUE, Color.BLACK});

        // ACCESSORIES - VARIOUS ITEMS
        createProductWithVariants("Baseball Cap", "Classic baseball cap", accessoriesCategory, versace, BigDecimal.valueOf(35), BigDecimal.valueOf(55), shirt, DressStyle.CASUAL, "Black_Striped_T-shirt.png", new Color[]{Color.BLACK, Color.BLUE, Color.WHITE});
        createProductWithVariants("Winter Beanie", "Warm winter beanie", accessoriesCategory, calvin, BigDecimal.valueOf(30), BigDecimal.valueOf(50), shirt, DressStyle.CASUAL, "Earth-Tone_Cloud_Wash_Hoodie.png", new Color[]{Color.BLACK, Color.GRAY});
        createProductWithVariants("Leather Belt", "Premium leather belt", accessoriesCategory, gucci, BigDecimal.valueOf(60), BigDecimal.valueOf(95), pants, DressStyle.FORMAL, "Loose_Fit_Bermouda_Shorts.png", new Color[]{Color.BLACK, Color.BROWN});
        createProductWithVariants("Silk Scarf", "Elegant silk scarf", accessoriesCategory, prada, BigDecimal.valueOf(45), BigDecimal.valueOf(75), shirt, DressStyle.FORMAL, "Courage_Graphic_T-shirt.png", new Color[]{Color.BLUE, Color.RED});
        createProductWithVariants("Wool Gloves", "Warm wool gloves", accessoriesCategory, zara, BigDecimal.valueOf(25), BigDecimal.valueOf(45), shirt, DressStyle.CASUAL, "Black_Striped_T-shirt.png", new Color[]{Color.BLACK, Color.GRAY});
        createProductWithVariants("Sunglasses", "Premium sunglasses", accessoriesCategory, versace, BigDecimal.valueOf(85), BigDecimal.valueOf(130), shirt, DressStyle.CASUAL, "Black_Striped_T-shirt.png", new Color[]{Color.BLACK, Color.BROWN});
        createProductWithVariants("Crossbody Bag", "Stylish crossbody bag", accessoriesCategory, gucci, BigDecimal.valueOf(120), BigDecimal.valueOf(180), shirt, DressStyle.CASUAL, "Courage_Graphic_T-shirt.png", new Color[]{Color.BLACK, Color.BROWN});
        createProductWithVariants("Backpack", "Durable backpack", accessoriesCategory, calvin, BigDecimal.valueOf(75), BigDecimal.valueOf(120), shirt, DressStyle.CASUAL, "Earth-Tone_Cloud_Wash_Hoodie.png", new Color[]{Color.BLACK, Color.GRAY});
        createProductWithVariants("Ankle Socks Bundle", "Comfortable socks", accessoriesCategory, zara, BigDecimal.valueOf(15), BigDecimal.valueOf(30), shirt, DressStyle.CASUAL, "Black_Striped_T-shirt.png", new Color[]{Color.BLACK, Color.WHITE});
        createProductWithVariants("Sports Watch", "Athletic sports watch", accessoriesCategory, prada, BigDecimal.valueOf(150), BigDecimal.valueOf(220), shirt, DressStyle.SPORT, "Black_Striped_T-shirt.png", new Color[]{Color.BLACK, Color.BLUE});

        // FORMAL COLLECTION - MEN'S
        createProductWithVariants("Business Blazer", "Professional business blazer", menCategory, prada, BigDecimal.valueOf(250), BigDecimal.valueOf(350), shirt, DressStyle.FORMAL, "Signature_Anchor_Tailored_Wool_Blazer.png", new Color[]{Color.BLACK, Color.BLUE, Color.GRAY});
        createProductWithVariants("Dress Shirt White", "Classic white dress shirt", menCategory, calvin, BigDecimal.valueOf(85), BigDecimal.valueOf(120), shirt, DressStyle.FORMAL, "Vertical_Striped_Shirt.png", new Color[]{Color.WHITE});
        createProductWithVariants("Tie Selection", "Different tie styles", menCategory, gucci, BigDecimal.valueOf(45), BigDecimal.valueOf(75), shirt, DressStyle.FORMAL, "Black_Striped_T-shirt.png", new Color[]{Color.BLACK, Color.BLUE, Color.RED});

        // GYM & SPORTS
        createProductWithVariants("Gym Tank Top", "Breathable tank top", menCategory, versace, BigDecimal.valueOf(40), BigDecimal.valueOf(65), shirt, DressStyle.SPORT, "Black_Striped_T-shirt.png", new Color[]{Color.BLACK, Color.BLUE});
        createProductWithVariants("running Shorts", "Lightweight running shorts", menCategory, calvin, BigDecimal.valueOf(55), BigDecimal.valueOf(85), pants, DressStyle.SPORT, "Loose_Fit_Bermouda_Shorts.png", new Color[]{Color.BLACK, Color.BLUE});
        createProductWithVariants("Performance Jacket", "Wind-resistant jacket", menCategory, zara, BigDecimal.valueOf(95), BigDecimal.valueOf(140), shirt, DressStyle.SPORT, "Earth-Tone_Cloud_Wash_Hoodie.png", new Color[]{Color.BLACK, Color.BLUE});
        createProductWithVariants("Women's Sports Bra", "Supportive sports bra", womenCategory, gucci, BigDecimal.valueOf(65), BigDecimal.valueOf(100), shirt, DressStyle.SPORT, "Courage_Graphic_T-shirt.png", new Color[]{Color.BLACK, Color.PURPLE});
        createProductWithVariants("Women's Running Tights", "Compression running tights", womenCategory, prada, BigDecimal.valueOf(85), BigDecimal.valueOf(130), pants, DressStyle.SPORT, "Loose_Fit_Bermouda_Shorts.png", new Color[]{Color.BLACK, Color.BLUE});

        // CASUAL COLLECTION - MORE VARIETY
        createProductWithVariants("Vintage Band Tee", "Retro band graphic", menCategory, zara, BigDecimal.valueOf(45), BigDecimal.valueOf(70), shirt, DressStyle.CASUAL, "Courage_Graphic_T-shirt.png", new Color[]{Color.BLACK, Color.GRAY});
        createProductWithVariants("Summer Linen Blend", "Breathable linen mix", menCategory, gucci, BigDecimal.valueOf(105), BigDecimal.valueOf(145), shirt, DressStyle.CASUAL, "Checkered_Shirt.png", new Color[]{Color.WHITE, Color.BLUE});
        createProductWithVariants("Casual Cardigan", "Lightweight cardigan", womenCategory, calvin, BigDecimal.valueOf(75), BigDecimal.valueOf(110), shirt, DressStyle.CASUAL, "Earth-Tone_Cloud_Wash_Hoodie.png", new Color[]{Color.GRAY, Color.BLUE, Color.PINK});
        createProductWithVariants("Denim Jacket", "Classic denim jacket", menCategory, prada, BigDecimal.valueOf(130), BigDecimal.valueOf(180), shirt, DressStyle.CASUAL, "Faded_Skinny_Jeans.png", new Color[]{Color.BLUE, Color.BLACK});
        createProductWithVariants("Leather Jacket", "Premium leather jacket", womenCategory, versace, BigDecimal.valueOf(250), BigDecimal.valueOf(350), shirt, DressStyle.FORMAL, "Black_Striped_T-shirt.png", new Color[]{Color.BLACK, Color.BROWN});
        createProductWithVariants("Rain Jacket", "Waterproof rain jacket", menCategory, zara, BigDecimal.valueOf(95), BigDecimal.valueOf(135), shirt, DressStyle.CASUAL, "Earth-Tone_Cloud_Wash_Hoodie.png", new Color[]{Color.BLACK, Color.BLUE});
        createProductWithVariants("Windbreaker", "Lightweight windbreaker", womenCategory, calvin, BigDecimal.valueOf(65), BigDecimal.valueOf(100), shirt, DressStyle.CASUAL, "Courage_Graphic_T-shirt.png", new Color[]{Color.BLUE, Color.PINK});
        createProductWithVariants("Sweatshirt", "Cozy sweatshirt", menCategory, gucci, BigDecimal.valueOf(85), BigDecimal.valueOf(125), hoodie, DressStyle.CASUAL, "Earth-Tone_Cloud_Wash_Hoodie.png", new Color[]{Color.GRAY, Color.BLACK});
        createProductWithVariants("Henley Long Sleeve", "Long sleeve henley", womenCategory, prada, BigDecimal.valueOf(65), BigDecimal.valueOf(100), shirt, DressStyle.CASUAL, "Courage_Graphic_T-shirt.png", new Color[]{Color.WHITE, Color.BLACK});
        createProductWithVariants("Button-Up Vest", "Casual button vest", menCategory, versace, BigDecimal.valueOf(110), BigDecimal.valueOf(160), shirt, DressStyle.CASUAL, "Vertical_Striped_Shirt.png", new Color[]{Color.BROWN, Color.BLACK});

        System.out.println("✅ Database initialized with mock products!");
    }

    // Helper methods
    private Category createCategory(String name, String description) {
        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        category.setImageUrl("https://picsum.photos/300/300?random=" + name.hashCode());
        return categoryRepository.save(category);
    }

    private Brand createBrand(String name) {
        Brand brand = new Brand();
        brand.setName(name);
        brand.setLogoUrl("https://picsum.photos/200/200?random=" + name.hashCode());
        return brandRepository.save(brand);
    }

    private ProductType createProductType(String name) {
        ProductType productType = new ProductType();
        productType.setName(name);
        return productTypeRepository.save(productType);
    }

    private void createProductWithVariants(String name, String description, Category category,
                                          Brand brand, BigDecimal price, BigDecimal originalPrice,
                                          ProductType productType, DressStyle dressStyle,
                                          String imageName, Color[] colors) {
        // Δημιουργία Product
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setCategory(category);
        product.setBrand(brand);
        product.setPrice(price);
        product.setOriginalPrice(originalPrice);
        product.setProductType(productType);
        product.setDressStyle(dressStyle);
        product.setRating(4.5);
        product.setReviewCount((int) (Math.random() * 200) + 10);

        // Υπολογισμός discount
        BigDecimal discount = originalPrice.subtract(price);
        int discountPercent = discount
                .multiply(BigDecimal.valueOf(100))
                .divide(originalPrice, 0, java.math.RoundingMode.UP)
                .intValue();
        product.setDiscountPercent(discountPercent);

        product = productRepository.save(product);

        // Δημιουργία ProductImage
        ProductImage image = new ProductImage();
        image.setProduct(product);
        image.setImageUrl("https://picsum.photos/500/600?random=" + product.getId());
        productImageRepository.save(image);

        // Δημιουργία ProductVariants (χρώμα + size συνδυασμοί)
        Size[] sizes = {Size.S, Size.M, Size.L, Size.XL};

        for (Color color : colors) {
            for (Size size : sizes) {
                ProductVariant variant = new ProductVariant();
                variant.setProduct(product);
                variant.setColor(color);
                variant.setSize(size);
                variant.setStockQuantity((int) (Math.random() * 50) + 10); // Random stock 10-60
                variant.setSku(generateSKU(product.getId(), color, size));
                productVariantRepository.save(variant);
            }
        }
    }

    private String generateSKU(Long productId, Color color, Size size) {
        // Δημιουργούμε unique SKU με random component για να αποφύγουμε duplicates
        String randomPart = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return String.format("SKU-%d-%s-%s-%s", productId, color.name().substring(0, 3), size.name(), randomPart);
    }
}

