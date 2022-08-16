class APIFeatures {
  constructor(dbquery, dbqueryStr) {
    //dbqueryStr = req.query string after ?
    this.dbquery = dbquery;
    this.dbqueryStr = dbqueryStr;
  }
  //if query string into incoming request, shaping here find method search criterias
  search() {
    const keyword = this.dbqueryStr.keyword
      ? {
          name: {
            $regex: this.dbqueryStr.keyword,
            $options: 'i',
          },
        }
      : {
          //nothing
        }; //return content(value) of keyword
    let kwb = { ...keyword };

    this.dbquery = this.dbquery.find({ ...keyword });
    return this;
  }

  filter() {
    const dbqueryCopy = { ...this.dbqueryStr };

    //removing fields from the query
    const removeFields = ['keyword', 'limit', 'page'];
    removeFields.forEach((el) => delete dbqueryCopy[el]);

    //advance filter for price, ratings etc as range of values
    let dbqueryStr = JSON.stringify(dbqueryCopy); //convert in string

    dbqueryStr = dbqueryStr.replace(
      /\b(gt|gte|lt|lte)\b/g,
      (match) => `$${match}`
    );

    this.dbquery = this.dbquery.find(JSON.parse(dbqueryStr));
    return this;
  }

  pagination(resPerPage) {
    let currentPage = Number(this.dbqueryStr.page) || 1;
    const skip = resPerPage * (currentPage - 1);

    this.dbquery = this.dbquery.limit(resPerPage).skip(skip);
    return this;
  }
}

module.exports = APIFeatures;
