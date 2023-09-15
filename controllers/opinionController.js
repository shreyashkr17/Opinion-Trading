const Opinion = require("../model/Opinion");

let opininoLength = 0;

const all_opinion = async (req,res) => {
    try{
        const {search, status, opinion_type, role, final_result, created_by} = req.query;

        const filter = {}

        if(search){
            filter.$or = [
                {title: {$regex: search, $options: 'i'}},
                {description : {$regex: search, $options: 'i'}},
                {news: {$regex: search, $options: 'i'}}
            ];
        }

        if(status){
            filter.status = status;
        }
        if(opinion_type){
            filter.opinion_type = opinion_type;
        }
        if(role){
            filter.role = role;
        }
        if(final_result){
            filter.final_result = final_result;
        }
        if(created_by){
            filter['details.createdBy'] = created_by;
        }


        const opinion = await Opinion.find(filter);
        res.json(opinion);
    }catch(error){
        res.status(500).json({error: 'An error occured while fetching opinion'});
    }
}



// Get Single Option
const get_opinion = async (req,res) => {
    try{
        const opinion = await Opinion.find({opinion_id:req.params.opinion_id});
        res.json(opinion);
    }catch(error){
        res.status(500).json({message:error});
    }
}

// Get single Status
const get_status = async (req,res) => {
    try{
        const opinion = await Opinion.find({status:req.params.status});
        res.json(opinion);
    }catch(error){
        res.status(500).json({message:error});
    }
}

// Add new Opinion
const add_opinion = async (req,res) => {
    console.log(req.body);
    const opinion = new Opinion({
        title: req.body.title,
        description: req.body.description,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        news: req.body.news,
        status: req.body.status,
        source_of_truth: req.body.source_of_truth,
        conditions: req.body.conditions,
        min_price: req.body.min_price,
        max_price: req.body.max_price,
        opinion_type: req.body.opinion_type,
        final_result: req.body.final_result,
        platform_owner_response : req.body.platform_owner_response,
        trade_volume: req.body.trade_volume,
        role: req.body.role,
        details: req.body.details
    });


    try {
        const saveAdmin = await opinion.save();
        res.json({
            opinion_id:saveAdmin.opinion_id
        });
    } catch (error) {
        res.status(400).send(error);
    }
};

// Delete Opinion
const delete_opinion = async (req,res) => {
    try{
        const removeOpinion = await Opinion.remove({opinion_id:req.params.opinion_id});
        res.json({message: `Opininon with id ${req.params.opinion_id} has been deleted`});
    }catch (error){
        res.json({message:error});
    }
};

// Update Opinion
const update_opinion = async (req,res) => {
    try{
        const opinion = await Opinion.find({opinion_id:req.params.opinion_id});
        const currentDateTime = new Date().toISOString();
        console.log(opinion);
        const date1 = new Date(currentDateTime);
        const date2 = opinion[0].end_date;

        consolo.log(date1);
        console.log(date2);

        // calculate the difference in milliseconds
        const difference = (date2-date1);
        console.log(difference);
        if(difference > 0){
            const opinion = {
                title: req.body.title,
                description: req.body.description,
                start_date: req.body.start_date,
                end_date: req.body.end_date,
                news: req.body.news,
                status: req.body.status,
                source_of_truth: req.body.source_of_truth,
                conditions: req.body.conditions,
                min_price: req.body.min_price,
                max_price: req.body.max_price,
                opinion_type: req.body.opinion_type,
                final_result: req.body.final_result,
                platform_owner_response : req.body.platform_owner_response,
                trade_volume: req.body.trade_volume,
                role: req.body.role,
                details: req.body.details
            };

            console.log(opinion);

            const updateOpinion = await Opinion.findOneAndUpdate(
                { opinion_id: req.params.opinion_id},
                opinion
            );
            res.json(opinion);
        }else{
            const opinion = {
                status:"Stopped"
            };
            console.log(opinion);
            const updatedopinion = await Opinion.findOneAndUpdate(
                {opinion_id:req.params.opinion_id},
                opinion
            );
            res.json({message:"This Opinion has been stopped"});
        }
    }catch(error){
        res.json({message:error});
    }
}; 

module.exports = {
    all_opinion,
    get_opinion,
    get_status,
    add_opinion,
    delete_opinion,
    update_opinion
}