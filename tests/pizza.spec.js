import { log } from "console";
import { test, expect } from "playwright-test-coverage";
import { json } from "stream/consumers";

test("home/about/history/franchise(no login) pages", async ({ page }) => {
  await page.goto("/");

  //home page
  await expect(page.getByRole("heading")).toContainText("The web's best pizza");

  //franchise link
  await page
    .getByRole("contentinfo")
    .getByRole("link", { name: "Franchise" })
    .click();
  await expect(page.getByRole("main")).toContainText(
    "So you want a piece of the pie?"
  );
  await expect(page.getByRole("main")).toContainText("Unleash Your Potential");

  await expect(page.getByRole("alert")).toContainText(
    "If you are already a franchisee"
  );

  // about page
  await page.getByRole("link", { name: "About" }).click();
  await expect(page.getByRole("main")).toContainText("The secret sauce");
  await expect(page.getByRole("list")).toContainText("about");
  await expect(page.getByRole("main")).toContainText("Our employees");
  await expect(page.getByRole("main").getByRole("img").first()).toBeVisible();

  // history page
  await page.getByRole("link", { name: "History" }).click();
  await expect(page.getByRole("list")).toContainText("history");
  await expect(page.getByRole("heading")).toContainText("Mama Rucci, my my");
  await expect(page.getByRole("main").getByRole("img")).toBeVisible();
});

test("purchase with login ", async ({ page }) => {
  await page.route("*/**/api/order/menu", async (route) => {
    const menuRes = [
      {
        id: 1,
        title: "Veggie",
        image: "pizza1.png",
        price: 0.0038,
        description: "A garden of delight",
      },
      {
        id: 2,
        title: "Pepperoni",
        image: "pizza2.png",
        price: 0.0042,
        description: "Spicy treat",
      },
    ];
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: menuRes });
  });

  await page.route("*/**/api/franchise", async (route) => {
    const franchiseRes = [
      {
        id: 2,
        name: "LotaPizza",
        stores: [
          { id: 4, name: "Lehi" },
          { id: 5, name: "Springville" },
          { id: 6, name: "American Fork" },
        ],
      },
      { id: 3, name: "PizzaCorp", stores: [{ id: 7, name: "Spanish Fork" }] },
      { id: 4, name: "topSpot", stores: [] },
    ];
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: franchiseRes });
  });

  await page.route("*/**/api/auth", async (route) => {
    const loginReq = { email: "d@jwt.com", password: "a" };
    const loginRes = {
      user: {
        id: 3,
        name: "Kai Chen",
        email: "d@jwt.com",
        roles: [{ role: "diner" }],
      },
      token: "abcdef",
    };
    expect(route.request().method()).toBe("PUT");
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  await page.route("*/**/api/order", async (route) => {
    const orderReq = {
      items: [
        { menuId: 1, description: "Veggie", price: 0.0038 },
        { menuId: 2, description: "Pepperoni", price: 0.0042 },
      ],
      storeId: "4",
      franchiseId: 2,
    };
    const orderRes = {
      order: {
        items: [
          { menuId: 1, description: "Veggie", price: 0.0038 },
          { menuId: 2, description: "Pepperoni", price: 0.0042 },
        ],
        storeId: "4",
        franchiseId: 2,
        id: 23,
      },
      jwt: "eyJpYXQ",
    };
    expect(route.request().method()).toBe("POST");
    expect(route.request().postDataJSON()).toMatchObject(orderReq);
    await route.fulfill({ json: orderRes });
  });

  await page.goto("/");

  // Go to order page
  await page.getByRole("button", { name: "Order now" }).click();

  // Create order
  await expect(page.locator("h2")).toContainText("Awesome is a click away");
  await page.getByRole("combobox").selectOption("4");
  await page.getByRole("link", { name: "Image Description Veggie A" }).click();
  await page.getByRole("link", { name: "Image Description Pepperoni" }).click();
  await expect(page.locator("form")).toContainText("Selected pizzas: 2");
  await page.getByRole("button", { name: "Checkout" }).click();

  // Login
  await page.getByPlaceholder("Email address").click();
  await page.getByPlaceholder("Email address").fill("d@jwt.com");
  await page.getByPlaceholder("Email address").press("Tab");
  await page.getByPlaceholder("Password").fill("a");
  await page.getByRole("button", { name: "Login" }).click();

  // Pay
  await expect(page.getByRole("main")).toContainText(
    "Send me those 2 pizzas right now!"
  );
  await expect(page.locator("tbody")).toContainText("Veggie");
  await expect(page.locator("tbody")).toContainText("Pepperoni");
  await expect(page.locator("tfoot")).toContainText("0.008 ₿");
  await page.getByRole("button", { name: "Pay now" }).click();

  // Check balance
  await expect(page.getByText("0.008")).toBeVisible();
});

test("docs", async ({ page }) => {
  await page.route("*/**/api/docs", async (route) => {
    const docsRes = {
      endpoints: [
        {
          method: "mocked POST",
          path: "/api/auth",
          description: "Register a new user",
          example:
            'curl -X POST localhost:3000/api/auth -d \'{"name":"pizza diner", "email":"d@jwt.com", "password":"diner"}\' -H \'Content-Type: application/json\'',
          response: {
            user: {
              id: 2,
              name: "pizza diner",
              email: "d@jwt.com",
              roles: [
                {
                  role: "diner",
                },
              ],
            },
            token: "tttttt",
          },
        },
        {
          method: "mocked PUT",
          path: "/api/auth/:userId",
          requiresAuth: true,
          description: "Update user",
          example:
            'curl -X PUT localhost:3000/api/auth/1 -d \'{"email":"a@jwt.com", "password":"admin"}\' -H \'Content-Type: application/json\' -H \'Authorization: Bearer tttttt\'',
          response: {
            id: 1,
            name: "常用名字",
            email: "a@jwt.com",
            roles: [
              {
                role: "admin",
              },
            ],
          },
        },
      ],
    };
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: docsRes });
  });

  await page.goto("/docs");

  await expect(page.getByRole("main")).toContainText("JWT Pizza API");
  await expect(page.getByRole("main")).toContainText("[mocked POST] /api/auth");
  await expect(page.getByRole("main")).toContainText("Register a new user");
  await expect(page.getByRole("main")).toContainText(
    'curl -X POST localhost:3000/api/auth -d \'{"name":"pizza diner", "email":"d@jwt.com", "password":"diner"}\' -H \'Content-Type: application/json\''
  );
  await expect(page.getByRole("main")).toContainText(
    '{ "user": { "id": 2, "name": "pizza diner", "email": "d@jwt.com", "roles": [ { "role": "diner" } ] }, "token": "tttttt" }'
  );
  await expect(page.getByRole("main")).toContainText(
    "🔐 [mocked PUT] /api/auth/:userId"
  );
  await expect(page.getByText("service: http://localhost:")).toBeVisible();
});

test("not found page", async ({ page }) => {
  const unroutedPage = "rand0mnotfound";
  await page.goto(`/${unroutedPage}`);

  await page.goto("http://localhost:5173/asdfj");

  await expect(page.getByRole("heading")).toContainText("Oops");
  await expect(page.getByRole("main")).toContainText(
    "It looks like we have dropped a pizza on the floor. Please try another page."
  );
});

test("register", async ({ page }) => {
  await page.route("*/**/api/auth", async (route) => {
    const registerReq = {
      name: "UI Tester",
      email: "UI@test.com",
      password: "test",
    };
    const registerRes = {
      user: {
        name: "UI Tester",
        email: "UI@test.com",
        roles: [
          {
            role: "diner",
          },
        ],
        id: 9,
      },
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiVUkgVGVzdGVyIiwiZW1haWwiOiJVSUB0ZXN0LmNvbSIsInJvbGVzIjpbeyJyb2xlIjoiZGluZXIifV0sImlkIjo5LCJpYXQiOjE3Mzk0OTQ4MDV9.wuG3m8SpSrhfeSGkejcbUjXNQixcqvdKWg69yYcKo0A",
    };

    const logoutRes = {
      message: "logout successful",
    };

    expect(["POST", "DELETE"]).toContain(route.request().method());
    if (route.request().method() === "POST") {
      expect(route.request().postDataJSON()).toMatchObject(registerReq);
      await route.fulfill({ json: registerRes });
    } else {
      await route.fulfill({ json: logoutRes });
    }
  });

  await page.route("*/**/api/order", async (route) => {
    const orderRes = [
      {
        dinerId: 9,
        orders: [],
        page: 1,
      },
    ];
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: orderRes });
  });

  await page.goto("http://localhost:5173/register");

  const registerUser = {
    name: "UI Tester",
    email: "UI@test.com",
    password: "test",
  };

  await expect(page.getByRole("heading")).toContainText("Welcome to the party");
  await expect(page.locator("form")).toContainText(
    "Already have an account? Login instead."
  );

  await expect(page.getByRole("textbox", { name: "Full name" })).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Email address" })
  ).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Password" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Register" })).toBeVisible();

  await page.getByRole("textbox", { name: "Full name" }).click();
  await page
    .getByRole("textbox", { name: "Full name" })
    .fill(registerUser.name);
  await page.getByRole("textbox", { name: "Email address" }).click();
  await page
    .getByRole("textbox", { name: "Email address" })
    .fill(registerUser.email);
  await page.getByRole("textbox", { name: "Password" }).click();
  await page
    .getByRole("textbox", { name: "Password" })
    .fill(registerUser.password);

  await page.getByRole("button", { name: "Register" }).click();

  const abbrev = (name) => {
    const names = name.split(" ");

    if (names.length > 1) {
      return names[0].charAt(0) + names[names.length - 1].charAt(0);
    } else {
      return names[0].charAt(0);
    }
  };

  //home page
  await expect(
    page.getByRole("link", { name: abbrev(registerUser.name), exact: true })
  ).toBeVisible();
  await page
    .getByRole("link", { name: abbrev(registerUser.name), exact: true })
    .click();

  //dinerDashboard
  await expect(page.getByRole("heading")).toContainText("Your pizza kitchen");
  await expect(page.getByRole("main")).toContainText(registerUser.name);
  await expect(page.getByRole("main")).toContainText(registerUser.email);

  //logout back to home page
  await page.getByRole("link", { name: "Logout" }).click();

  await page.getByText("The web's best pizza", { exact: true }).click();
});
