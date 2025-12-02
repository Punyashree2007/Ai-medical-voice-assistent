"use client";

import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import moment from "moment";

function ViewReportDialog({ record }: any) {
  const report = record?.report ?? {}; // SAFE fallback

  return (
    <Dialog>
      <DialogTrigger className="text-blue-600 underline cursor-pointer">
        View Report
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle asChild>
            <h2 className="text-center text-4xl text-blue-700">
              🩺 Medical AI Voice Assistant Report
            </h2>
          </DialogTitle>

          <DialogDescription asChild>
            <div
              className="w-full max-w-4xl mx-auto p-6 overflow-y-auto"
              style={{ maxHeight: "80vh" }}
            >
              <div className="mt-10 space-y-6">
                {/* Session Info */}
                <section>
                  <h2 className="font-bold text-blue-500 text-lg mb-2">Session Info:</h2>

                  <div className="grid grid-cols-2 gap-4">
                    <p>
                      <span className="font-bold">Doctor Specialization:</span>{" "}
                      {record?.selectedDoctor?.specialist ?? "N/A"}
                    </p>

                    <p>
                      <span className="font-bold">Consulted Date:</span>{" "}
                      {record?.createdOn ? moment(new Date(record.createdOn)).fromNow() : "N/A"}
                    </p>

                    <p>
                      <span className="font-bold">User:</span>{" "}
                      {report?.user ?? "N/A"}
                    </p>

                    <p>
                      <span className="font-bold">Agent:</span>{" "}
                      {report?.agent ?? "N/A"}
                    </p>
                  </div>

                  <hr className="border-blue-400 mt-4" />
                </section>

                {/* Report */}
                <section>
                  <h2 className="font-bold text-blue-500 text-lg mb-2">Report:</h2>
                  <p className="text-gray-700">
                    {record?.notes ?? "No notes available"}
                  </p>
                  <hr className="border-blue-400 mt-4" />
                </section>

                {/* Summary */}
                <section>
                  <h2 className="font-bold text-blue-500 text-lg mb-2">Summary:</h2>
                  <p>{report?.summary ?? "N/A"}</p>
                  <hr className="border-blue-400 mt-4" />
                </section>

                {/* Symptoms */}
                <section>
                  <h2 className="font-bold text-blue-500 text-lg mb-2">Symptoms:</h2>
                  <p>
                    {Array.isArray(report?.symptoms)
                      ? report.symptoms.join(", ")
                      : report?.symptoms ?? "N/A"}
                  </p>
                  <hr className="border-blue-400 mt-4" />
                </section>

                {/* Duration + Severity */}
                <section className="grid grid-cols-2 gap-4">
                  <p>
                    <span className="font-bold">Duration:</span>{" "}
                    {report?.duration ?? "N/A"}
                  </p>
                  <p>
                    <span className="font-bold">Severity:</span>{" "}
                    {report?.severity ?? "N/A"}
                  </p>
                </section>

                <hr className="border-blue-400 mt-4" />

                {/* Medications Mentioned */}
                <section>
                  <h2 className="font-bold text-blue-500 text-lg mb-2">
                    Medications Mentioned:
                  </h2>
                  <p>
                    {Array.isArray(report?.medicationsMentioned)
                      ? report.medicationsMentioned.join(", ")
                      :
                      report?.medicationsMentioned ?? "N/A"}
                  </p>
                  <hr className="border-blue-400 mt-4" />
                </section>

                {/* Recommendations */}
                <section>
                  <h2 className="font-bold text-blue-500 text-lg mb-2">
                    Recommendations:
                  </h2>
                  <p>
                    {Array.isArray(report?.recommendations)
                      ? report.recommendations.join(", ")
                      :
                      report?.recommendations ?? "N/A"}
                  </p>
                </section>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default ViewReportDialog;


