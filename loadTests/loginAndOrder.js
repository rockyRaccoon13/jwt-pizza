import { sleep, check, group, fail } from "k6";
import http from "k6/http";
import jsonpath from "https://jslib.k6.io/jsonpath/1.0.2/index.js";

export const options = {
  cloud: {
    distribution: {
      "amazon:us:ashburn": { loadZone: "amazon:us:ashburn", percent: 100 },
    },
    apm: [],
  },
  thresholds: {},
  scenarios: {
    Scenario_1: {
      executor: "ramping-vus",
      gracefulStop: "30s",
      stages: [
        { target: 5, duration: "30s" },
        { target: 15, duration: "1m" },
        { target: 10, duration: "30s" },
        { target: 0, duration: "30s" },
      ],
      gracefulRampDown: "30s",
      exec: "scenario_1",
    },
  },
};

export function scenario_1() {
  let response;

  const vars = {};

  group(
    "Class Site Pizza Login and Order - https://pizza.pizzajwt.click/",
    function () {
      // Homepage
      response = http.get("https://pizza.pizzajwt.click/", {
        headers: {
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "accept-encoding": "gzip, deflate, br, zstd",
          "accept-language": "en-US,en;q=0.9",
          "cache-control": "max-age=0",
          "if-modified-since": "Thu, 20 Jun 2024 17:26:43 GMT",
          priority: "u=0, i",
          "sec-ch-ua":
            '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"macOS"',
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "same-origin",
          "sec-fetch-user": "?1",
          "upgrade-insecure-requests": "1",
        },
      });
      sleep(16.3);

      // Login
      response = http.put(
        "https://pizza-service.pizzajwt.click/api/auth",
        '{"email":"d@jwt.com","password":"diner"}',
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br, zstd",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "application/json",
            origin: "https://pizza.pizzajwt.click",
            priority: "u=1, i",
            "sec-ch-ua":
              '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"macOS"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
          },
        }
      );

      if (
        !check(response, {
          "status equals 200": (response) =>
            response.status.toString() === "200",
        })
      ) {
        console.log(response.body);
        fail("Login was *not* 200");
      }

      vars["token1"] = jsonpath.query(response.json(), "$.token")[0];

      sleep(5.2);

      // Get Menu
      response = http.get(
        "https://pizza-service.pizzajwt.click/api/order/menu",
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br, zstd",
            "accept-language": "en-US,en;q=0.9",
            authorization: `Bearer ${vars["token1"]}`,
            "content-type": "application/json",
            origin: "https://pizza.pizzajwt.click",
            priority: "u=1, i",
            "sec-ch-ua":
              '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"macOS"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
          },
        }
      );

      // Get Franchise
      response = http.get(
        "https://pizza-service.pizzajwt.click/api/franchise",
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br, zstd",
            "accept-language": "en-US,en;q=0.9",
            authorization: `Bearer ${vars["token1"]}`,
            "content-type": "application/json",
            origin: "https://pizza.pizzajwt.click",
            priority: "u=1, i",
            "sec-ch-ua":
              '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"macOS"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
          },
        }
      );
      sleep(11);

      // Place order
      response = http.post(
        "https://pizza-service.pizzajwt.click/api/order",
        '{"items":[{"menuId":1,"description":"Veggie","price":0.0038}],"storeId":"1","franchiseId":1}',
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br, zstd",
            "accept-language": "en-US,en;q=0.9",
            authorization: `Bearer ${vars["token1"]}`,
            "content-type": "application/json",
            origin: "https://pizza.pizzajwt.click",
            priority: "u=1, i",
            "sec-ch-ua":
              '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"macOS"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
          },
        }
      );

      vars["jwt"] = jsonpath.query(response.json(), "$.jwt")[0];
      sleep(2);

      // Verify Jwt
      response = http.post(
        "https://pizza-factory.cs329.click/api/order/verify",
        `{"jwt": "${vars["jwt"]}"}`,
        {
          headers: {
            accept: "*/*",
            "accept-encoding": "gzip, deflate, br, zstd",
            "accept-language": "en-US,en;q=0.9",
            authorization: `Bearer ${vars["token1"]}`,
            "content-type": "application/json",
            origin: "https://pizza.pizzajwt.click",
            priority: "u=1, i",
            "sec-ch-ua":
              '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"macOS"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
          },
        }
      );
    }
  );
}
