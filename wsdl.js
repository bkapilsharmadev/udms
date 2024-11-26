const soap = require("soap");
const sax = require("sax");

const wsdlUrl = "./faculty.wsdl";

const options = {
	wsdl_options: {
		gzip: true, // Enable compression
	},
};

soap.createClient(wsdlUrl, (err, client) => {
	if (err) {
		console.error("Error creating SOAP client:", err);
		return;
	}

	const args = {
		EndDate: "2024-10-01",
		StartDate: "2024-10-01",
		ResourceType: "P",
		ItResourceId: { item: [{ ResourceId: "40001557" }] },
	};

	client.ZapiFacultyAvailability(
		args,
		(err, result, rawResponse, soapHeader, rawRequest) => {
			if (err) {
				console.error("Error invoking SOAP method:", err);
				return;
			}

			console.log("SOAP Response received, parsing with SAX...");

			// Parse the rawResponse using SAX
			const parser = sax.createStream(true); // true enables strict mode

			parser.on("opentag", (node) => {
				if (node.name === "item") {
					console.log("Start of item:", node);
				}
			});

			parser.on("text", (text) => {
				console.log("Text node:", text.trim());
			});

			parser.on("closetag", (name) => {
				if (name === "item") {
					console.log("End of item.");
				}
			});

			parser.on("error", (error) => {
				console.error("Parsing error:", error);
			});

			parser.on("end", () => {
				console.log("Finished parsing the SOAP response.");
			});

			// Stream the raw SOAP XML response to the parser
			const responseStream = require("stream").Readable.from([rawResponse]);
			responseStream.pipe(parser);
		}
	);
});
