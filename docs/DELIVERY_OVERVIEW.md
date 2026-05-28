# E-Shop Web Application, Delivery Overview

Functional overview prepared for Deloitte.

This document follows the structure of the original project specification. It takes each part of the brief in turn, the overview, the eight key functionalities, and the additional notes, and explains how the delivered application meets it. It describes what the application does for the people who use it and stays away from the inner workings of the code.

## Overview

The delivered product is a fully working e-commerce web application that follows the supplied Figma design. A visitor can browse the catalogue, search for products, read and write reviews, build a cart and a wishlist, complete a guided checkout, and follow their orders afterwards. Authorised staff have a separate, private administration area for managing the catalogue, processing orders, handling customer accounts, and adjusting store-wide settings. Where the Figma file did not specify a particular screen, the missing pieces were designed to match the existing look so the experience stays visually consistent throughout.

## 1. User Authentication and Profile Management

Customers can register, sign in, and sign out. Registration asks for an email address, a password, a first and last name, and a phone number, and each field is checked as it is entered so the email is a valid address, the password is at least eight characters, and the phone number is in a sensible format before the account is created. If the email is already registered, the application explains that it is already in use rather than creating a duplicate.

Passwords are kept secure. They are never stored in a form anyone can read, not even staff, because they are protected with one-way encryption. Signing in checks the email and password and then keeps the customer signed in across page reloads and return visits until they choose to sign out, at which point the session ends straight away. To resist automated guessing, the sign-in and registration screens are rate limited, so a source making too many rapid attempts is briefly refused before any password is even checked.

Every customer has a profile page where they can view and update their personal information, including their name, email, phone, and password, and they can remove their account if they wish. A customer only ever sees and edits their own profile.

The brief listed password reset by email as optional for the first version. It was not included in this delivery and can be added later as a follow-up.

## 2. Product Catalogue

Products are shown in a responsive grid that pages through the catalogue a set number of products at a time, so even a large catalogue stays quick to load and easy to scan. Each product card shows the image, the name, the current price, the original price with a discount badge when the item is on sale, the star rating, and quick actions to add the item straight to the cart or the wishlist without opening the full page.

Customers can narrow the catalogue with filters for category, price range, colour, size, and dress style, and they can combine several at once. They can also sort by newest arrivals, by most popular, or by price in either direction. The current filters, sort order, and page are reflected in the page address, so a customer can bookmark or share a filtered view and return to exactly the same selection. If someone enters a price range that does not make sense, such as a minimum above the maximum, the application points this out rather than quietly returning nothing.

A search box is available throughout the store. As the customer types, the application suggests matching products in a short live list, so they can jump straight to a product without finishing the whole search. Submitting the search opens a full results page that pages and lays out like the rest of the catalogue.

The product detail page shows everything a customer needs to decide. There is an image carousel for viewing several photos of the item, a full description, and the price with any discount clearly shown. The customer then chooses from the available variants, the colour and size combinations the store actually carries, and because each variant tracks its own stock the page shows live availability and prevents a combination that is out of stock from being selected. From here the customer can add the chosen variant to the cart or save it to the wishlist. The page also shows the product's customer reviews together with its average rating, so shoppers can see what others thought.

## 3. Shopping Cart

Customers can add items to the cart, change the quantity of any item, and remove items. Adding the same colour and size of a product again increases the quantity of the existing line instead of creating a duplicate. When something is added, the application checks that enough stock is available, including the combined quantity if the item is already in the cart, so a customer cannot put more in their cart than the store holds.

The cart clearly shows the subtotal of the items, the tax, the shipping fee, and the final total, so the full cost is visible before checkout. For signed-in customers the cart is saved to their account, which means it is still waiting on their next visit or on another device. A clear action takes them on to checkout when they are ready.

## 4. Checkout Process

Checkout is a guided flow with a progress indicator that shows four stages, shipping, payment, review, and confirmation. In the shipping stage the customer provides a delivery address, either choosing one of their saved addresses or entering a new one, and the details are validated before they continue. In the payment stage they choose how to pay from three options, card, PayPal, and cash on delivery, and when card is chosen the card details are checked for the expected format. In keeping with the brief, payment is simulated rather than charged to a real provider.

The review stage gathers everything together so the customer can confirm the address, the payment method, the items, and the totals before committing. When they place the order, the application carries out the work as a single all-or-nothing operation. It re-checks that every item is still in stock, confirms the chosen address belongs to the customer, calculates the subtotal, tax, shipping, and total, creates the order with a unique order number, records each line, reduces the stock of each item, and empties the cart. If anything goes wrong along the way, none of these changes are kept and the cart is left untouched, so a customer is never left with a half-finished order or stock that was wrongly reduced. A further safeguard prevents overselling, so if two customers try to buy the last unit of the same item at the same moment, only one succeeds. Once the order is placed, the customer sees a confirmation page with the order number and a summary of what they bought.

## 5. Wishlist Page

Customers can save products to a personal wishlist and remove them again, and each product appears on the wishlist only once. The wishlist shows every saved product with its image, name, and price, along with quick actions. From the wishlist a customer can move a product into the cart, choosing the colour and size at that point, after which the item leaves the wishlist. The wishlist is saved to the customer's account and is still there on their next visit.

## 6. Order Management

Every customer has an order history that lists their past orders with the most recent first, and each order shows its order number, the date it was placed, its current status, the items it contains, and the totals. An order moves through a clear set of statuses over its life, from pending to processing, then shipped, then delivered, with the option of being cancelled, so customers always know where their order stands.

Customers can also reorder a previous order in one action. The application adds the items from that order back into the cart while taking current availability into account. If something from the old order is no longer available, because it sold out or was removed from the catalogue, that item is skipped and the customer is told which items could not be added, while the rest go into the cart as normal. The accuracy of order history is protected too, because each order keeps its own record of the product names and the prices paid at the time of purchase, so a past order stays correct even if prices change or products are later removed.

## 7. Admin Panel

Staff have a separate, protected administration area that is closed to ordinary customers. From it they can manage the full product catalogue, creating, editing, and removing products along with the variants of each product, the colour and size combinations and the stock held for each, and the product images. They can manage the catalogue's structure as well, including categories, brands, and product types, so the catalogue can grow over time.

Staff can see all orders placed in the store and move each one along its lifecycle by updating its status as it is processed, shipped, and delivered. They can view the registered customer accounts and manage their roles, for example promoting a customer to a staff role, with a safeguard that stops an administrator from accidentally removing their own access and locking the team out. The administration area also lets staff adjust the store-wide tax rate and shipping fee, with the new values taking effect on the next order straight away and no need to change code or restart anything, and it is where staff approve the store testimonials that should appear publicly.

## 8. Responsive Design

The interface follows the supplied Figma design in its layout, typography, colour, and spacing. It is fully responsive and adapts cleanly from large desktop screens down to tablets and phones, and it uses smooth transitions where they help the experience.

## Additional notes on quality

The application was built with attention to good practice in how it is organised, how it protects its users, and how it performs. The most important flows, including accounts, the cart, orders, checkout, and the rules that keep each customer's data private, are covered by automated tests on both the customer-facing side and the server side, which helps keep the application dependable as it changes. The interface aims to stay faithful to the Figma design in typography, colour, spacing, and the way controls respond, and accessibility was kept in mind for the interactive parts, including keyboard navigation and descriptive labelling on key controls.

Throughout the application, customers can only ever see and act on their own information, their own cart, wishlist, addresses, orders, and profile, and never anyone else's, while administrative features remain restricted to staff accounts.

## A note on the technical approach

Without going into the inner workings, the application is built on widely adopted, well-supported technologies. The customer-facing side is built with React and the server side with Java and Spring Boot, with information held in a relational database and the two sides communicating over a standard web interface. These are mature, mainstream choices that keep the application straightforward to maintain and ready to grow. Two items remain as natural next steps toward a production launch, adding password reset by email, which the brief marked as optional, and connecting a live payment service in place of the current simulated payment.