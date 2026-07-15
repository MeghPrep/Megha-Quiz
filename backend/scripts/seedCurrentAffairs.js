import dns from "dns"; // 🌟 Added core DNS library
import mongoose from "mongoose";
import dotenv from "dotenv";
import CurrentAffair from "../model/CurrentAffair.js";
import CurrentAffairArticle from "../model/CurrentAffairArticle.js";
import CurrentAffairQuestion from "../model/CurrentAffairQuestion.js";

// 🌟 FORCE GOOGLE DNS TO RESOLVE MONGODB SRV RECORDS OVER LOCAL NETWORK BLOCKS
dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config();

async function seedModule() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URL);
    console.log("⚡ Connected securely to MongoDB Atlas.");

    // 1. Clean existing records in this tracking block to avoid testing duplication
    const issueTitleTarget = "6th - 12th July 2026";
    const existingIssue = await CurrentAffair.findOne({
      weekTitle: issueTitleTarget,
    });
    if (existingIssue) {
      await CurrentAffairArticle.deleteMany({
        currentAffairs: existingIssue._id,
      });
      await CurrentAffairQuestion.deleteMany({
        currentAffairs: existingIssue._id,
      });
      await CurrentAffair.deleteOne({ _id: existingIssue._id });
      console.log("🧹 Flushed existing test data for this edition issue.");
    }

    // 2. Create the Parent Publication Edition Document
    const parentIssue = await CurrentAffair.create({
      title: "Meghalaya Current Affairs",
      weekTitle: issueTitleTarget,
      startDate: new Date("2026-07-06"),
      endDate: new Date("2026-07-12"),
      description:
        "Comprehensive weekly briefing covering rainfall metrics, legislative updates, and local developmental infrastructure.",
      status: "published",
    });
    console.log(
      `📝 Parent Issue Created: [${parentIssue.weekTitle}] ID: ${parentIssue._id}`,
    );

    // 3. Create News Editorial Articles
    const articlesData = [
      {
        currentAffairs: parentIssue._id,
        title: "Meghalaya Records Staggering 74% Monsoon Rainfall Deficit",
        summary:
          "IMD Shillong reports low rainfall numbers caused by zero active pressure nodes.",
        content:
          "As per official statements by IMD Shillong Director Thangjalal Lhouvum, Meghalaya has recorded a staggering 74% deficit in rainfall this monsoon. The primary driver cited for this critical decline is the absolute absence of favorable weather systems developing over the Bay of Bengal region.",
        examPoint:
          "Meghalaya recorded a 74% monsoon rainfall deficit due to weak weather nodes over the Bay of Bengal.",
        articleDate: new Date("2026-07-08"),
        articleOrder: 1,
      },
      {
        currentAffairs: parentIssue._id,
        title:
          "CM Conrad K. Sangma Leads Institutional Delegation Over FCRA Amendments",
        summary:
          "State leadership conveys civil group anxieties to Union Home Minister Amit Shah.",
        content:
          "Meghalaya CM Conrad K. Sangma led a joint delegation of institutional and church leaders, including representatives from the Presbyterian Church of India, Garo Baptist Convention, and Catholic Archdiocese of Shillong, to meet Union Home Minister Amit Shah in New Delhi. The group registered urgent concerns regarding Section 16A(5) of the FCRA Amendment Bill 2026, which empowers administrative authorities to seize assets of organizations whose registration is canceled.",
        examPoint:
          "Section 16A(5) of the FCRA Amendment Bill 2026 enables state asset seizures if registration drops.",
        articleDate: new Date("2026-07-09"),
        articleOrder: 2,
      },
    ];

    const insertedArticles =
      await CurrentAffairArticle.insertMany(articlesData);
    console.log(
      `📰 Injected ${insertedArticles.length} Editorial Newspaper Articles.`,
    );

    // 4. Inject Parallel Revision Quiz Questions (Sample matching your payload)
    const questionsData = [
      {
        currentAffairs: parentIssue._id,
        questionNumber: 1,
        question:
          "What is the rainfall deficit recorded in Meghalaya this monsoon as per IMD?",
        options: ["50%", "64%", "74%", "84%"],
        answerKey: "C", // Mapped to option index layout or matching string parse
        solution:
          "Meghalaya recorded a staggering 74% deficit in rainfall this monsoon as confirmed by IMD Shillong.",
      },
      {
        currentAffairs: parentIssue._id,
        questionNumber: 2,
        question:
          "What is the main reason cited by IMD Shillong for the reduced rainfall in Meghalaya?",
        options: [
          "Deforestation",
          "No favourable weather systems over the Bay of Bengal",
          "Climate change in Himalayas",
          "El Nino effect in Pacific Ocean",
        ],
        answerKey: "B",
        solution:
          "IMD Shillong Director Thangjalal Lhouvum said a lack of systems over the Bay of Bengal caused the low rainfall.",
      },
    ];

    const insertedQuestions =
      await CurrentAffairQuestion.insertMany(questionsData);
    console.log(
      `🎯 Seeded ${insertedQuestions.length} Revision Questions linked to this Edition.`,
    );

    console.log(
      "🏁 Fullstack Current Affairs Module Seeding Completed Successfully.",
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding execution failure:", error);
    process.exit(1);
  }
}

seedModule();
