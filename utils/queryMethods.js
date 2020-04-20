class QueryMethods {

    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    // 1) FILTERING
    filter() {
        // 1A) Simple Filtering
        const queryObj = {
            ...this.queryString
        };

        const excludeeFields = ['page', 'sort', 'limit', 'fields'];
        excludeeFields.forEach(el => delete queryObj[el]);

        // 1B) Advanced Filtering (gt , gte, lt, lte)
        // mongo db filtering : { duration: {&gte : 5 }}
        // express filtering : { duration: { gte : 5} }
        // so we replace express filtering to the type of mongodb filtering

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        // Inorder to apply sorting, pagination etc... we have to omit await querying..
        // we will use await while executing... if we use await we cannot use pagination, sorting etc...
        // const tours = await Tour.find(queryObj);

        this.query = this.query.find(JSON.parse(queryStr));
        // console.log('query : ', query, '>>> queryString');
        // The below code put as reference for mongoose query sample
        /* const query = Tour.find()
          .where('duration')
          .equals(5)
          .where('difficulty')
          .equals('easy');
        */

        return this;
    }

    // 2) Sorting
    sort() {

        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            // The above code converts queryString from .sort(name,duration,...) to .sort(name duration ...)
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }

        return this;

    }

    // 3) Fields
    showFields() {

        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }

        return this;

    }

    // 4) Pagination and Page Limits
    paginate() {

        const page = this.queryString.page * 1 || 1; // This trick converts string to int
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }

}

module.exports = QueryMethods;