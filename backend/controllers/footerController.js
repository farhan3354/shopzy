import Footer from "../models/footerModel.js";

export const getFooter = async (req, res) => {
  try {
    const footer = await Footer.findOne({ isActive: true });

    if (!footer) {
      return res.json({
        success: true,
        footer: getDefaultFooter(),
      });
    }

    res.json({
      success: true,
      footer,
    });
  } catch (error) {
    console.error("Get footer error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch footer",
    });
  }
};

export const updateFooter = async (req, res) => {
  try {
    const { about, moreInfo, contact, social, securePayment, decorative } =
      req.body;

    await Footer.updateMany({}, { isActive: false });

    const footer = new Footer({
      about,
      moreInfo,
      contact,
      social,
      securePayment,
      decorative,
      createdBy: req.user.id,
      isActive: true,
    });

    await footer.save();

    res.json({
      success: true,
      message: "Footer updated successfully",
      footer,
    });
  } catch (error) {
    console.error("Update footer error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update footer",
    });
  }
};

// Get footer history (for admin)
export const getFooterHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const footers = await Footer.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Footer.countDocuments();

    res.json({
      success: true,
      footers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get footer history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch footer history",
    });
  }
};

// Default footer data
const getDefaultFooter = () => ({
  about: {
    title: "About Us",
    content:
      "At Aramya, comfort meets fashion with stylish and breathable kurtas, kurta sets, and dresses crafted for all-day comfort. Plus, you can choose different sizes for tops and bottoms, so can always find the right fit.",
  },
  moreInfo: {
    title: "More info",
    links: [
      {
        column1: [
          { text: "Terms of Service", href: "/terms" },
          { text: "Privacy Policy", href: "/privacy" },
          { text: "Return Policy", href: "/return" },
          { text: "Shipping Policy", href: "/shipping" },
          { text: "Store Locator", href: "/stores" },
        ],
        column2: [
          { text: "Sitemap", href: "/pages/sitemap" },
          { text: "Products Sitemap", href: "/pages/products-sitemap" },
          { text: "Size Chart", href: "/pages/kurti-size-chart" },
          { text: "Blogs", href: "/pages/blogs" },
        ],
      },
    ],
  },
  contact: {
    title: "Contact us",
    content: {
      help: { text: "Need Help?", href: "/contact-us" },
      company: "Manufactured and Marketed by",
      address:
        "DSLR Technologies Pvt. Ltd.\nPhase 3, 994-995, near to Vitromed, Sitapura Industrial Area, Sitapura, Jaipur, Rajasthan 302022",
    },
  },
  social: {
    title: "Follow us on",
    platforms: [
      {
        name: "Facebook",
        icon: "facebook",
        href: "#",
      },
      {
        name: "Instagram",
        icon: "instagram",
        href: "#",
      },
      {
        name: "YouTube",
        icon: "youtube",
        href: "#",
      },
      {
        name: "Pinterest",
        icon: "pinterest",
        href: "#",
      },
    ],
  },
  decorative: {
    image: "https://assets.aramya.in/images/images/home-footer-decorative.png",
    alt: "Aramya",
  },
});
