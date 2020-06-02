const puppeteer = require("puppeteer");
const fs = require("fs");
const credsFile = process.argv[2];
const movie = process.argv[3];

// main function
(async function () {
	// retrieve credentials
	let data = await fs.promises.readFile(credsFile, "utf-8");
	let creds = JSON.parse(data);
	email = creds.email;
	password = creds.password;

	// launch browser
	let browser = await puppeteer.launch({
		headless: false,
		defaultViewport: null,
		args: ["--start-maximized", "--disable-notifications"],
	});

	let numberOfPages = await browser.pages();
	let tab = numberOfPages[0];

	// goto IMDb Homepage
	await tab.goto("https://www.imdb.com/", {
		waitUntil: "networkidle2",
	});

	// login
	await login(tab, email, password);

	// search
	await tab.waitForSelector(
		"#nav-search-form > div.search-category-selector > div > label > div"
	);
	await tab.click(
		"#nav-search-form > div.search-category-selector > div > label > div"
	);

	await tab.waitForSelector(
		'#navbar-search-category-select-contents > ul > a[aria-label="Titles"]'
	);
	await tab.click(
		'#navbar-search-category-select-contents > ul > a[aria-label="Titles"]'
	);

	await tab.waitForSelector("#suggestion-search");
	await tab.type("#suggestion-search", movie);
	// await tab.keyboard.press("Enter");

	await tab.waitForSelector("#react-autowhatever-1--item-0 > a");
	await navigationHelper(tab, "#react-autowhatever-1--item-0 > a");
})();

// login function
async function login(tab, email, password) {
	await tab.waitForSelector("#imdbHeader div.navbar__user");
	await navigationHelper(tab, "#imdbHeader div.navbar__user");

	await tab.waitForSelector(
		"#signin-options > div > div:nth-child(2) > a:nth-child(1)"
	);
	await navigationHelper(
		tab,
		"#signin-options > div > div:nth-child(2) > a:nth-child(1)"
	);

	await tab.waitForSelector('input[type="email"]');
	await tab.type('input[type="email"]', email, { delay: 100 });

	await tab.waitForSelector('input[type="password"]');
	await tab.type('input[type="password"]', password, { delay: 100 });

	await tab.waitForSelector('input[type="submit"]');
	await navigationHelper(tab, 'input[type="submit"]');
}

// helper function for navigation
async function navigationHelper(tab, selector) {
	await Promise.all([
		tab.waitForNavigation({
			waitUntil: "networkidle2",
		}),
		tab.click(selector),
	]);
}
