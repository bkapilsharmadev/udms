const reportsService = require("../services/reports.service");
const documentService = require("../services/documents.service");

module.exports.renderDashboard = async (req, res, next) => {
	const session_user = req.session_username;

	const result = await Promise.all([
		reportsService.docsCreatedCount({ session_user }, req.dbTransaction),
		reportsService.docsReceivedCount({ session_user }, req.dbTransaction),
		reportsService.docsPendingCount({ session_user }, req.dbTransaction),
		reportsService.docsApprovedCount({ session_user }, req.dbTransaction),
		reportsService.docsRejectedCount({ session_user }, req.dbTransaction),
		reportsService.docsApprovalTimeStats({ session_user }, req.dbTransaction),
		documentService.getDocuments(
			{
				pageNo: 1,
				pageSize: 3,
				cursor: null,
				isOr: null,
				filterCriteria: [],
				orderCriteria: [],
				searchCriteria: {},
				findById: false,
				session_user,
			},
			req.dbTransaction
		),
		documentService.getDocumentsCount(
			{
				isOr: null,
				filterCriteria: [],
				searchCriteria: {},
				session_user,
			},
			req.dbTransaction
		)
	]);

	const data = {
		docsCreatedCount:
			result[0].toString().length === 1 ? `0${result[0]}` : result[0],
		docsReceivedCount:
			result[1].toString().length === 1 ? `0${result[1]}` : result[1],
		docsPendingCount:
			result[2].toString().length === 1 ? `0${result[2]}` : result[2],
		docsApprovedCount:
			result[3].toString().length === 1 ? `0${result[3]}` : result[3],
		docsRejectedCount:
			result[4].toString().length === 1 ? `0${result[4]}` : result[4],
		docsApprovalTimeStats: result[5],
		docs: result[6],
		totalDocCount: result[7],
	};

	// console.log(data);

	res.render("dashboard.ejs", { data });
};
