// Static owner map — fetched once, used everywhere
// Owner ID → name. Add to this as team grows.
export const OWNERS: Record<string, string> = {
  "77347043": "Cindy Gong",
  "78311771": "Naomi Pacheco",
  "79537809": "Emma Abi Hanna",
  "79537810": "Adina Young",
  "82567125": "Madilynn Pinson",
  "82567126": "Kate MacKenzie",
  "83708268": "Avery Frasch",
  "85041620": "Jessi Lamb",
  "85186701": "Craig Hunkele",
  "89111907": "Nahja Martin",
  "113357067": "Nico Gimenez",
  "115249312": "Ryan Lechner",
  "187249552": "Jesse Tillotson",
  "210854496": "Natalie Miller",
  "227491348": "Lisa Winge",
  "227491349": "Grant Scott",
  "227491351": "Bill Calhoun",
  "227491353": "Christine Lizarraga",
  "227491357": "Valerie Bagley",
  "228415511": "Amber Bollinger",
  "235951664": "Crystal Hoffman",
  "236342663": "David Jones",
  "247876012": "Emma Graben",
  "278412369": "Candace Lizarraga",
  "305813680": "Jordy Fisher",
  "360802447": "Ritzelle Bautista",
  "438568762": "Rakesh M",
  "560789641": "Account Services",
  "561768030": "Kerena Monroig",
  "561774612": "Kevin Cook",
  "968887083": "Kyle Athans",
  "1257332704": "Denise Paik",
};

export const KYLE_OWNER_ID = "968887083";

export function ownerName(id: string | null | undefined): string {
  if (!id) return "Unknown";
  return OWNERS[id] ?? `Owner ${id}`;
}

export function attendeeNames(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(";")
    .map((id) => ownerName(id.trim()))
    .filter(Boolean);
}
