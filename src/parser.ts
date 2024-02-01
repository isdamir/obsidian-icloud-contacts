import { parse as vcfParse } from "vcf";

export type ParsedVCard = {
	key: string;
	meta: { [key: string]: string | string[] };
	type: string;
	value: string | string[];
};

export function parseVCard(vcardString: string): ParsedVCard[] {
	const jCard = vcfParse(vcardString)[0].toJSON();
	// console.log("jCard: ", JSON.stringify(jCard[1].slice(1), null, 2));

	return jCard[1].map((item) => {
		return {
			key: item[0],
			meta: item[1],
			type: item[2],
			value: item[3],
		};
	});
}

export function getFullName(vCardString: string): string {
	const parsedVCard = parseVCard(vCardString);
	const isOrg =
		parsedVCard.find(({ key }) => key === "xAbShowAs")?.value === "COMPANY";
	if (isOrg) {
		return (
			parsedVCard.find(({ key }) => key === "org")?.value as string
		).replace(/;$/, "");
	}

	const fullName = parsedVCard.find(({ key }) => key === "fn");
	if (fullName && fullName.value) {
		return fullName.value as string;
	}

	const name = parsedVCard.find(({ key }) => key === "n");
	if (!name) throw new Error("Unable to get full name");
	return convertNameToFullName(name.value as string[]);
}

export function convertNameToFullName([
	familyName,
	givenName,
	additionalMiddleNames,
	honorificPrefixes,
	honorificSuffixes,
]: string[]) {
	return [
		honorificPrefixes,
		givenName,
		additionalMiddleNames,
		familyName,
		honorificSuffixes,
	]
		.filter((p) => !!p)
		.join(" ");
}
