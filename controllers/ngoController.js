const ngos = require('../data/ngos');

// GET ALL NGOS OR FILTER BY CATEGORY
const getNGOs = async (req, res) => {
  try {
    const { category } = req.query;

    let filteredNGOs = ngos;

    if (category) {
      filteredNGOs = ngos.filter(ngo => ngo.category.includes(category));
    }

    res.status(200).json({
      success: true,
      data: filteredNGOs
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getNGOs };