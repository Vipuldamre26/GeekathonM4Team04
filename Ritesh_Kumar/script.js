// Get the container for displaying products
const productsContainer = document.getElementById("products-container");

// Function to render product containers
async function renderProducts() {
  try {
    // Fetch data from products.json
    const response = await fetch("products.json");
    const products = await response.json();

    // Loop through each product and create a container
    products.forEach((product) => {
      const container = document.createElement("div");
      container.classList.add("product-container");

      // Adding product details to the container
      container.innerHTML = `
                <img src="${product.image}" alt="${product.title}">
                <h2>${product.title}</h2>
                <p class = "rating">${product.rating}</p>
                <span class="special"> Rs. ${product.specialPrice}<p class="price">Rs. ${product.price}</p></span>
                <button class="pay-now" onclick="handlePayment('${product.title}', ${product.specialPrice}, '${product.image}')">Buy Now</button>
                
            `;
      // Append the container to the products container
      productsContainer.appendChild(container);
    });
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

// Function to handle payment using Razorpay
function handlePayment(productTitle, productPrice, productImage) {
  // Preload the audio for success notification
  const successSound = new Audio("./assets/thank-you-for-shopping-garvins.mp3");
  successSound.preload = "auto";

  // Configure options for Razorpay
  const options = {
    key: "rzp_test_vUb7sebKsHQx5K", // Razorpay API key
    amount: productPrice * 100, // Amount in paisa
    currency: "INR",
    name: productTitle,
    description: `Payment for ${productTitle}`,
    image: productImage,
    handler: function (response) {
      // Show success notification and play the success sound
      toastr["success"](`Payment successful for${productTitle}!`);
      // Play the preloaded success sound
      successSound.play();
    },
    prefill: {
      name: "Customer Name",
      email: "customer@example.com",
      contact: "XXXXXXXXXX",
    },
    notes: {
      address: "Customer Address",
    },
    theme: {
      color: "#092ca8", // Replace with your desired color
    },
  };
  // Create a Razorpay instance with the options
  const rzp = new Razorpay(options);
  // Open the Razorpay payment dialog
  rzp.open();
}

// Call the renderProducts function to display product containers
renderProducts();
