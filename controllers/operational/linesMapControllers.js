const table = 'tb_m_lines'
const { queryCustom } = require('../../helpers/query')
const response = require('../../helpers/response')
module.exports = {
	getData: async (req, res) => {
		try {
			let q = `WITH RECURSIVE sublines AS (
	SELECT
		line_id,
		parent_id,
		line_nm,
		line_desc,
		line_lvl,
		idx_pos
	FROM
		${table}
	WHERE
		line_id = ${req.params.line_id} --22
	UNION
		SELECT
			e.line_id,
			e.parent_id,
			e.line_nm,
			e.line_desc,
			e.line_lvl,
			e.idx_pos
		FROM
			${table} e
		INNER JOIN sublines s ON s.line_id = e.parent_id
) SELECT
	sublines.line_id,
	sublines.parent_id,
	sublines.line_nm,
	sublines.line_desc,
	sublines.line_lvl,
	sublines.idx_pos
FROM
	sublines
order by parent_id, idx_pos ASC`
			await queryCustom(q).then(async (result) => {
				if (result.rows.length > 0) {
					function BuildChild(data, currentChild) {
						//Creating current child object
						var child = {};
						child.line_id = currentChild.line_id;
						child.line_nm = currentChild.line_nm;
						child.line_desc = currentChild.line_desc;
						child.line_lvl = currentChild.line_lvl;
						child.children = [];

						//Looking for childrens in all input data
						var currentChildren = data.filter(item => item.parent_id == child.line_id);
						if (currentChildren.length > 0) {
							currentChildren.forEach(function (item) {
								//Iterating threw children and calling the recursive function
								//Adding the result to our current children
								child.children.push(BuildChild(data, item));
							});
						}
						return child;
					}
					response.success(res, 'Success to get Lines Machines Map Data', BuildChild(result.rows, result.rows.find(child => child.parent_id == null)))
				}
			})
		} catch (error) {
			console.log(error);
			response.failed(res, error)
		}
	},
}