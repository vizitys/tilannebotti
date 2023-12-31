import * as cheerio from "cheerio";

export async function fetchTilannehuone(number: number = 0) {
  // TODO: location filter

  const url = "https://www.tilannehuone.fi/halytys.php";
  const html = await fetch(url);

  if (!html.ok) {
    throw new Error("Failed to fetch Tilannehuone.fi");
  }

  const $ = cheerio.load(await html.text());

  const rows = $("table.halytyslista .halytys");

  const alerts = rows
    .map((i, el) => {
      const $el = $(el);

      const image = $el.find("img").attr("src");
      const location = $el.find(".kunta").text();
      const date = $el.find(".pvmdate").text().trim();

      // time is a text node with no tag so we have to filter it out
      let time = $el
        .find(".pvm")
        .contents()
        .filter(function () {
          return this.nodeType == 3;
        })
        .text()
        .trim();

      if (time.length !== 8) {
        time = `0${time}`;
      }

      const type = $el.find("td:nth-child(4)").text();

      let description = "";
      if ($el.hasClass("artlnkcss")) {
        description = $el.next().find(".infotxt").text();
      }

      return {
        image,
        location,
        date,
        time,
        type,
        description,
      };
    })
    .get();

  return alerts[number];
}
