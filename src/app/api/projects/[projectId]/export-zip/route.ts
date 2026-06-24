import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import { buildProjectZipBuffer } from "@/lib/export/load-project-zip";



type RouteParams = { params: { projectId: string } };



/** GET /api/projects/[projectId]/export-zip — dossier complet (docs + brevet + analyses IA) */

export async function GET(_request: Request, { params }: RouteParams) {

  try {

    const supabase = await createClient();

    const {

      data: { user },

    } = await supabase.auth.getUser();



    if (!user) {

      return NextResponse.json({ error: "Non authentifie — reconnectez-vous." }, { status: 401 });

    }



    const built = await buildProjectZipBuffer(supabase, params.projectId);

    if (!built.ok) {

      return NextResponse.json({ error: built.error }, { status: built.status });

    }



    return new NextResponse(new Uint8Array(built.buffer), {

      headers: {

        "Content-Type": "application/zip",

        "Content-Disposition": `attachment; filename="${built.filename}"`,

      },

    });

  } catch (err) {

    console.error("[export-zip]", err);

    return NextResponse.json(

      {

        error:

          "Erreur serveur lors de l'export ZIP. Redemarrez le serveur (npm run dev) apres la mise a jour.",

      },

      { status: 500 }

    );

  }

}


