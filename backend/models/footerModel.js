import mongoose from "mongoose";

const footerSchema = new mongoose.Schema(
  {
    about: {
      title: {
        type: String,
        default: "About Us",
      },
      content: {
        type: String,
        required: true,
      },
    },
    moreInfo: {
      title: {
        type: String,
        default: "More info",
      },
      links: [
        {
          column1: [
            {
              text: String,
              href: String,
            },
          ],
        },
      ],
    },
    contact: {
      title: {
        type: String,
        default: "Contact us",
      },
      content: {
        help: {
          text: {
            type: String,
            default: "Need Help?",
          },
          href: {
            type: String,
            default: "/contact-us",
          },
        },
        company: {
          type: String,
          default: "Manufactured and Marketed by",
        },
        address: {
          type: String,
          required: true,
        },
      },
    },
    social: {
      title: {
        type: String,
        default: "Follow us on",
      },
      platforms: [
        {
          name: String,
          icon: String,
          href: String,
        },
      ],
    },

    decorative: {
      image: String,
      alt: {
        type: String,
        default: "Aramya",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthModel",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Footer", footerSchema);

// import mongoose from "mongoose";

// const contactDetailSchema = new mongoose.Schema({
//   type: {
//     type: String,
//     required: true,
//     enum: ["phone", "email", "whatsapp", "address"],
//   },
//   label: {
//     type: String,
//     required: true,
//   },
//   value: {
//     type: String,
//     required: true,
//   },

// });

// const footerSchema = new mongoose.Schema(
//   {
//     about: {
//       title: {
//         type: String,
//         default: "About Us",
//       },
//       content: {
//         type: String,
//         required: true,
//       },
//     },
//     contact: {
//       title: {
//         type: String,
//         default: "Contact us",
//       },
//       company: {
//         type: String,
//         default: "Manufactured and Marketed by",
//       },
//       address: {
//         type: String,
//         required: true,
//       },
//       details: [contactDetailSchema],
//     },
//     copyright: {
//       type: String,
//       default: "Copyright© Aramya All Rights Reserved.",
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// footerSchema.statics.getOrCreateFooter = async function () {
//   let footer = await this.findOne();

//   if (!footer) {
//     footer = await this.create({
//       about: {
//         title: "About Us",
//         content:
//           "Welcome to our store. We provide the best products with excellent customer service.",
//       },
//       contact: {
//         title: "Contact us",
//         company: "Manufactured and Marketed by",
//         address: "Add your company address here",
//         details: [
//           {
//             type: "phone",
//             label: "Customer Care",
//             value: "+91-1234567890",
//             href: "tel:+911234567890",
//           },
//           {
//             type: "email",
//             label: "Email Support",
//             value: "support@example.com",
//             href: "mailto:support@example.com",
//           },
//         ],
//       },
//     });
//   }

//   return footer;
// };

// export default mongoose.model("Footer", footerSchema);
