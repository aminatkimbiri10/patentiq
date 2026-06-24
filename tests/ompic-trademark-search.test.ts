import { describe, expect, it } from "vitest";
import {
  extractOmpicResultCount,
  parseOmpicTrademarkRows,
} from "@/lib/surveillance/ompic-trademark-search";

const SAMPLE = `
rows[0]=new Array("3843341","<a href='#' onClick='consulterDetail(3843341)'>222487</a>","COCA-COLA","L. 17/97");
rows[1]=new Array("4164705","<a href='#' onClick='consulterDetail(4164705)'>244138</a>","COCA-COLA CREATIONS"," ");
<span class="titre">257 Résultats trouvés</span>
`;

describe("ompic-trademark-search parser", () => {
  it("parses trademark rows from OMPIC HTML", () => {
    const rows = parseOmpicTrademarkRows(SAMPLE);
    expect(rows).toHaveLength(2);
    expect(rows[0]?.title).toBe("COCA-COLA");
    expect(rows[0]?.depositNumber).toBe("222487");
  });

  it("extracts result count", () => {
    expect(extractOmpicResultCount(SAMPLE)).toBe(257);
  });
});
