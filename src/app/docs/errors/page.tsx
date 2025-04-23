import SectionTitle from "@/app/components/docs/SectionTitle";

export default function ErrorCodesPage() {
	return (
		<main className="flex-1 p-8 w-full lg:w-3/4 mx-auto">
			<SectionTitle title="Errors" />

			<div className="prose prose-invert max-w-none">
				<p className="mb-4">
					This document explains all possible error responses from the
					API and what they might mean. Requests might return errors
					due to an internal server error, a bad request, or an
					invalid API key. In case of an error, the API will return a
					JSON response with the error code and a description of the
					error:
				</p>
				<pre>
					<code className="text-teal-50 text-sm shadow-lg flex p-4 rounded-md bg-gray-800">
						{`{\n\t"error_description": "A description of the error"\n\t"error_code": "A code for the error"\n\t"documentation_url": "A link to the documentation"\n}`}
					</code>
				</pre>
				<p className="mt-4">
					In addition to a human readable error message, the API will
					return an appropriate HTTP status code.
				</p>

				<h2 className="mt-6 text-3xl font-bold tracking-tight">
					Error codes
				</h2>
				<p className="mt-4">
					Below are detailed descriptions of every possible error code
					response.
				</p>
				<div className="mt-6 overflow-x-auto rounded-lg shadow-lg">
					<table className="w-full text-left border-collapse bg-teal-800/50">
						<thead className="bg-teal-900 text-teal-50">
							<tr>
								<th className="px-6 py-3 text-sm font-semibold uppercase">
									Error code
								</th>
								<th className="px-6 py-3 text-sm font-semibold uppercase">
									HTTP status
								</th>
								<th className="px-6 py-3 text-sm font-semibold uppercase">
									Description
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-teal-700">
							<tr className="">
								<td className="px-6 py-4 text-teal-50">
									invalid_request
								</td>
								<td className="px-6 py-4 text-white/80">
									400 Bad Request
								</td>
								<td className="px-6 py-4 text-white/80">
									The request is invalid or malformed. The
									error details will contain a more detailed
									description of the exact reason, but common
									issues are typos in field names, incorrect
									types of parameters, or missing required
									parameters.
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</main>
	);
}
