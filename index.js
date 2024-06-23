const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const server = http.createServer(app);
const billId = require('./order-id.js')

const nodemailer = require("nodemailer");

require("./conn.js");
const MenuItem = require("./models/menu.js");
const Order = require("./models/order.js");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "kushalhts00@gmail.com", // Replace with your Gmail email address
    pass: "tahgrshrqdezqqsq", // Replace with your Gmail password or an app-specific password
  },
});

const wss = new WebSocket.Server({ server });

// Map to store admin WebSocket connections
const adminConnections = new Map();

wss.on("connection", (ws) => {
  console.log("Client connected to WebSocket.");

  // Handle incoming messages from WebSocket clients
  ws.on("message", (message) => {
    try {
      const parsedMessage = JSON.parse(message);

      if (parsedMessage.type === "authenticatekushal") {
        const userId = parsedMessage.userId;
        // Store the WebSocket connection with the corresponding admin user ID
        adminConnections.set(userId, ws);
        console.log(adminConnections, "mm");
        console.log(`Admin with ID ${userId} authenticated.`);
      } else {
        console.log(`Received message: ${message}`);
      }
    } catch (error) {
      console.error("Failed to parse message:", error);
    }
  });
});
// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(bodyParser.json());
// const menuItems = [
//   { id: 1, category: "Breads", name: "Parantha", description: "Flaky, layered Indian bread filled with rich buttery taste. Perfectly pairs with spicy curries or creamy gravies.", price: 5, half: false, veg: true, chefSpecial: true, kidsChoice: false, combos: false },
//   { id: 2, category: "Breads", name: "Naan", description: "Soft, leavened Indian bread traditionally cooked in a tandoor. Its pillowy texture and slightly charred edges make it an irresistible accompaniment to any meal.", price: 3, half: false, veg: true, chefSpecial: false, kidsChoice: true, combos: false },
//   { id: 3, category: "Snacks", name: "Samosa", description: "Crispy pastry filled with spiced potatoes, peas, and aromatic spices. A popular street food snack enjoyed across the Indian subcontinent.", price: 2, half: false, veg: true, chefSpecial: false, kidsChoice: false, combos: true },
//   { id: 4, category: "Snacks", name: "Pakora", description: "Crispy fried fritters made with assorted vegetables coated in a spiced chickpea flour batter. Perfect for rainy days or as a tea-time snack.", price: 3, half: false, veg: true, chefSpecial: false, kidsChoice: false, combos: false },
//   { id: 5, category: "Main Course", name: "Dal Makhani", description: "Creamy lentil curry cooked with butter, cream, and aromatic spices. Slow-cooked to perfection, it's a comforting dish that pairs well with rice or naan.", price: 8, half: true, veg: true, chefSpecial: true, kidsChoice: false, combos: false },
//   { id: 6, category: "Main Course", name: "Paneer Tikka", description: "Cubes of paneer marinated in a flavorful blend of yogurt and spices, then grilled to perfection. Served with mint chutney, it's a vegetarian delight.", price: 10, half: false, veg: true, chefSpecial: false, kidsChoice: false, combos: false },
//   { id: 7, category: "Main Course", name: "Chicken Biryani", description: "Fragrant basmati rice cooked with succulent chicken pieces, aromatic spices, and caramelized onions. Served with raita and a squeeze of lemon, it's a festive meal.", price: 12, half: false, veg: false, chefSpecial: false, kidsChoice: false, combos: false },
//   { id: 8, category: "Drinks", name: "Mango Lassi", description: "Refreshing yogurt-based drink blended with ripe mangoes, sugar, and a touch of cardamom. A perfect thirst-quencher on a hot summer day.", price: 4, half: true, veg: true, chefSpecial: false, kidsChoice: false, combos: false },
//   { id: 9, category: "Drinks", name: "Masala Chai", description: "Spiced Indian tea brewed with aromatic spices like cardamom, cinnamon, cloves, and ginger. Served with milk and sugar, it's a comforting beverage.", price: 2, half: false, veg: true, chefSpecial: false, kidsChoice: false, combos: false },
//   { id: 10, category: "Appetizers", name: "Chicken Wings", description: "Crispy chicken wings marinated in a tangy sauce, then deep-fried to perfection. Served with a side of ranch dressing, they are a favorite at any gathering.", price: 6, half: true, veg: false, chefSpecial: false, kidsChoice: false, combos: false },
//   { id: 11, category: "Appetizers", name: "Bruschetta", description: "Toasted bread slices topped with a flavorful mixture of diced tomatoes, garlic, basil, and olive oil. A classic Italian appetizer that bursts with fresh flavors.", price: 5, half: false, veg: true, chefSpecial: false, kidsChoice: false, combos: false },
//   { id: 12, category: "Appetizers", name: "Caprese Salad", description: "Simple yet elegant salad made with ripe tomatoes, fresh mozzarella cheese, basil leaves, and a drizzle of balsamic glaze. A light and refreshing starter.", price: 7, half: false, veg: true, chefSpecial: false, kidsChoice: false, combos: false },
//   { id: 13, category: "Desserts", name: "Gulab Jamun", description: "Soft and spongy milk balls soaked in a fragrant sugar syrup flavored with rose water and cardamom. A decadent Indian sweet enjoyed during festivals and celebrations.", price: 3, half: false, veg: true, chefSpecial: false, kidsChoice: false, combos: false },
//   { id: 14, category: "Desserts", name: "Rasgulla", description: "Spongy balls made from cottage cheese kneaded into a dough, then cooked in a sugar syrup until soft and spongy. A popular Bengali sweet enjoyed chilled.", price: 3, half: true, veg: true, chefSpecial: false, kidsChoice: false, combos: false },
//   { id: 15, category: "Desserts", name: "Kheer", description: "Creamy Indian rice pudding made with fragrant basmati rice, milk, sugar, and flavored with cardamom, saffron, and nuts. A delightful sweet treat served chilled or warm.", price: 4, half: false, veg: true, chefSpecial: false, kidsChoice: false, combos: false },
// ];

function sendMessageToAdmin(userId, message) {
  const adminWs = adminConnections.get(userId);
  if (adminWs && adminWs.readyState === WebSocket.OPEN) {
    adminWs.send(message);
    console.log(`Message sent to admin with ID ${userId}: ${message}`);
  } else {
    console.log(`Admin with ID ${userId} is not connected.`);
  }
}



app.post('/connect', async (req, res) => {
 
  try {
    // Extract data from the payload
    const foundOrder = req.body;
    const adminUserId = "admin123"; // Assuming the admin user ID is fixed for this example

    // Send the WebSocket message to the admin
    sendMessageToAdmin(adminUserId, JSON.stringify(foundOrder));

    // Respond with a success message
    res.status(200).json({ message: 'WebSocket message sent to admin successfully' });
  } catch (error) {
    // Handle errors
    console.error('Error sending WebSocket message to admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }

});




app.delete('/orders/:tableNumber', async (req, res) => {
  const { tableNumber } = req.params;

  try {
    // Delete orders based on the provided table number
    const deletedOrders = await Order.deleteMany({ tableNumber });

    if (deletedOrders.deletedCount > 0) {
      return res.status(200).json({ message: `Orders for table ${tableNumber} deleted successfully` });
    } else {
      return res.status(404).json({ message: `No orders found for table ${tableNumber}` });
    }
  } catch (error) {
    console.error('Error deleting orders:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Sample endpoint to simulate order creation and notify the admin
app.post("/new-order", async(req, res) => {


  const final_order_number = await billId();
  console.log(final_order_number,"kkkkkkkkkkk")

  cr_id = final_order_number;






  const newOrderData = req.body; // Assuming the payload is sent in the request body
  newOrderData.billId=cr_id;
  console.log(newOrderData,"llllllllll")
  const newOrder = new Order(newOrderData);

await  newOrder
    .save()
    .then((savedOrder) => {
   
    })
    .catch((error) => {
     return res.status(500).json({ error: "Error saving order" });
    });

 await Order.findOne({ billId:newOrderData.billId })
    .then((foundOrder) => {
      if (foundOrder) {
       
        const adminUserId = "admin123";
        sendMessageToAdmin(adminUserId, JSON.stringify(foundOrder));
      } else {
        // res.status(404).json({ error: 'Order not found' });
      }
    })
    .catch((error) => {
    return  res.status(500).json({ error: "Error fetching order" });
    });

return  res.status(200).json({ message: "Order received successfully." });
});




app.delete('/krde', async (req, res) => {
  try {
      await Order.deleteMany({});
      res.status(200).send({ message: 'All orders deleted successfully' });
  } catch (err) {
      res.status(500).send({ error: 'An error occurred while deleting orders' });
  }
});
















app.put('/orders/:billId', async (req, res) => {
  const billId = req.params.billId;
  const { status } = req.body;
  try {
      const updatedOrder = await Order.findOneAndUpdate({ billId }, { status }, { new: true });
      if (!updatedOrder) {
          return res.status(404).json({ error: 'Order not found' });
      }
      res.json(updatedOrder);
  } catch (error) {
      res.status(500).json({ error: 'Error updating order' });
  }
});

app.get('/all-orders', async (req, res) => {
  try {
      const orders = await Order.find();
      console.log(orders)
      res.json(orders);
  } catch (error) {
      res.status(500).json({ error: 'Error fetching orders' });
  }
});
app.get("/menu", async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    console.log(menuItems);
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/menu/:id", async (req, res) => {
  const menuItemId = req.params.id;

  try {
    // Find the menu item by ID and delete it
    const deletedMenuItem = await MenuItem.findByIdAndDelete(menuItemId);

    if (!deletedMenuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.json({ message: "Menu item deleted successfully", deletedMenuItem });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete menu item", error: error.message });
  }
});

app.put("/menu/:id", async (req, res) => {
  const menuItemId = req.params.id;
  const {
    name,
    price,
    description,
    category,
    chefSpecial,
    veg,
    kidsChoice,
    combos,
  } = req.body;

  try {
    // Find the menu item by ID and update the specified fields
    const updatedMenuItem = await MenuItem.findByIdAndUpdate(
      menuItemId,
      {
        name,
        price,
        description,
        category,
        chefSpecial,
        veg,
        kidsChoice,
        combos,
      },
      { new: true } // To return the updated document
    );

    if (!updatedMenuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.json({ message: "Menu item updated successfully", updatedMenuItem });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update menu item", error: error.message });
  }
});

app.delete("/category/:categoryName", async (req, res) => {
  const { categoryName } = req.params;
  console.log(categoryName, "llllllllllllllllllllllllll");
  //res.send(categoryName)
  try {
    // Remove all documents from the database that have the specified category name
    const result = await MenuItem.deleteMany({ category: categoryName });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "No documents found for the provided category" });
    }

    res.json({
      message: "Documents deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete documents", error: error.message });
  }
});

app.put("/category/", async (req, res) => {
  const { currentCategoryName, newCategoryName } = req.body;
  console.log(
    newCategoryName,
    currentCategoryName,
    "llllllllllllllllllllllllll"
  );
  //res.send(categoryName)
  try {
    // Remove all documents from the database that have the specified category name
    const result = await MenuItem.updateMany(
      { category: currentCategoryName }, // Condition to match documents
      { $set: { category: newCategoryName } } // Set the new category name
    );

    if (result.nModified === 0) {
      return res
        .status(404)
        .json({ message: "No documents found for the provided category" });
    }

    res.json({
      message: "Documents updated successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update documents", error: error.message });
  }
});

app.post("/menu/add", async (req, res) => {
  try {
    console.log(req.body);
    const {
      name,
      price,
      description,
      category,
      chefSpecial,
      veg,
      kidsChoice,
      combos,
    } = req.body;

    // Create a new MenuItem document
    const menuItem = new MenuItem({
      name,
      price,
      description,
      category,
      chefSpecial,
      veg,
      kidsChoice,
      combos,
    });

    // Save the new MenuItem document to the database
    await menuItem.save();

    res.status(201).json({ message: "Menu item added successfully", menuItem });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add menu item", error: error.message });
  }
});

app.post("/menu", async (req, res) => {
  try {
    for (const menuItemData of menuItems) {
      // Create a new MenuItem document
      const newMenuItem = new MenuItem(menuItemData);
      // Save the document to the database
      await newMenuItem.save();
      console.log(`Inserted ${newMenuItem.name} into the database`);
    }
  } catch (error) {
    console.error("Error inserting menu items:", error);
  }
  res.send("inserdet ");
});

app.post("/checkVerificationCode", async (req, res) => {
  if (req.body.verificationCode == 456654) {
    res.send("success");
  } else {
    res.send("fail");
  }
});
// Endpoint to generate order and notify admin
app.post("/generateOrder", async (req, res) => {
  // Generate order ID



  const mailOptions = {
    from: "Aoji FOOdies <kushalhts00@gmail.com>",
    to: "kushalhts00@gmail.com",
    subject: "OTP Verification for Aoji FOOdies",
    html: `
        <div style="font-family: Arial, sans-serif; background-image: url('burger.png'); background-size: cover;">
            <div style="background-color: rgba(255, 255, 255, 0.8); padding: 20px;">
                <img src="https://res.cloudinary.com/bmc21/image/upload/v1717239910/WhatsApp_Image_2024-06-01_at_16.33.48_lazp8s.jpg" alt="Aoji FOOdies Logo" style="display: block; margin: 0 auto; width: 200px; opacity: 0.8;">
                <h2 style="text-align: center;">OTP Verification</h2>
                <p style="text-align: center;">Thank you for choosing Aoji FOOdies. Your OTP for verification is:</p>
                <div style="background-color: #f5f5f5; border-radius: 5px; padding: 10px; text-align: center; font-size: 24px; margin: 0 auto; width: fit-content;">
                    <strong>456654</strong>
                </div>
                <p style="text-align: center;">This OTP is valid for a single use and will expire in a short period of time. Please do not share it with anyone.</p>
                <p style="text-align: center;">If you did not request this OTP, please ignore this email.</p>
                <p style="text-align: center;">Regards,</p>
                <p style="text-align: center;">Aoji FOOdies Team</p>
            </div>
        </div>
    `

};
  console.log(mailOptions);
  // Send the email
  const info = await transporter.sendMail(mailOptions);
  console.log("Email sent: ", info.messageId);

  //   const billId = uuidv4();
  // console.log(req.body)
  // Save order to database (replace with your database logic)

  // Notify admin clients about the new order
  // function sendbillIdToAdmins(billId) {
  //   const message = JSON.stringify({ event: 'newOrder', billId });
  //   adminClients.forEach((client) => {
  //     if (client.readyState === WebSocket.OPEN) {
  //       client.send(message);
  //     }
  //   });
  // }

  // Example usage: Send order ID to admins when a new order is received
  // Replace this with your actual logic to handle new orders

  // sendbillIdToAdmins(billId);
  // Respond with order ID
  res.json({ hi: "hh" });
});

// Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
