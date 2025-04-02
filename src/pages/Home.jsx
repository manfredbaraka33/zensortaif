import React,{useState} from 'react'
import axios from "axios";
import {useDropzone} from "react-dropzone"
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFilePdf, FaFileCsv, FaDownload } from "react-icons/fa";


const Home = () => {

  const [jobDesc, setJobDesc] = useState("");
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

   // React Dropzone configuration
   const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles); // Set files on drop
    },
    accept: ".pdf, .docx", // Allow only PDF and DOCX files
  });

 

  const handleJobDescChange = (e) => {
    setJobDesc(e.target.value);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("job_desc", jobDesc);
    for (let file of files) {
      formData.append("files", file);
    }

    try {
         // Debugging FormData contents
        for (let pair of formData.entries()) {
            console.log(pair[0], pair[1]);
        }

        console.log("Data before sending to backend",formData);
      const response = await axios.post("http://localhost:8000/compute_similarity/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // Sorting results in descending order based on similarity_score
    const sortedResults = response.data.results.sort((a, b) => b.similarity_score - a.similarity_score);

      setResults(sortedResults);
    } catch (error) {
      console.error(error);
      
    } finally {
      setLoading(false);
    }
  };


  const styles = {
    dropzone: {
      border: "2px dashed #cccccc",
      padding: "20px",
      marginBottom: "20px",
      textAlign: "center",
      borderRadius: "5px",
      cursor: "pointer",
      backgroundColor: "#0D0D0D",
      color:"#ffffff"
    }
  };

  const downloadCSV = () => {
    if (results.length === 0) return;

    const headers = ["CV Filename,Similarity Score"];
    const rows = results.map(result => `${result.cv_filename},${result.similarity_score}`);

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "cv_similarity_results.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};


const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Adding title
    doc.text("Similarity Score Results", 10, 10);
    
    // Defining table headers and data
    const tableColumn = ["CV Filename", "Similarity Score"];
    const tableRows = results.map(result => [result.cv_filename, result.similarity_score + "%"]);
  
    // Generate the table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

 // Add "Generated by Zenscore" branding in the footer
  const pageHeight = doc.internal.pageSize.height; // Get PDF page height
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");

 
   // Set color and add "ZenSort" part (Green)
   doc.setTextColor(0, 220, 0); // Green for "ZenSort"
   const t1 = "ZenSort";
   doc.text(t1, 10, pageHeight - 10); // Position at the bottom
 
   // Set color and add "A" part (Blue)
   doc.setTextColor(0, 0, 204); // Blue for "A"
   const t2 = "A";
   doc.text(t2, doc.getTextWidth(t1) + 10, pageHeight - 10); // Position after "ZenSort"
 
   // Set color and add "I" part (Red)
   doc.setTextColor(200, 0, 0); // Red for "I"
   const t3 = "I";
   doc.text(t3, doc.getTextWidth(t1 + t2) + 10, pageHeight - 10); // Position after "ZenSortA"
 
  
    // Save the PDF
    doc.save("CV_Analysis_Results.pdf");
  };
  

  

  return (
    <div className='conatiner-fluid p-3'>
        <div className="row">
            <center>
            <div className="col-10">
            <textarea
                placeholder="Enter job description"
                value={jobDesc}
                onChange={handleJobDescChange}
                rows="5"
                cols="10"
                className='form-control'
                required
            />
            </div>
            </center>
        </div>

      
    <div className="row my-3">
        <center>
        <div className="col-10">
            {/* Drag and Drop or Click to Upload */}
            <div {...getRootProps()} style={styles.dropzone}>
                <input {...getInputProps()} required />
               <p>Drag & Drop files here, or click to select files</p>
            </div>
      
        </div>
        {/* Display selected file names */}
        {files.length > 0 && (
              <div style={{ marginTop: "10px", color: "#fff" }}>
                <h5>Selected Files:</h5>
                <ul>
                  {files.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
        </center>
    </div>
    <center>
          
            {loading ? ( <button className="btn btn-primary" disabled={loading}>
                <span className="spinner-grow spinner-grow-sm mx-2"></span>
                Checking...
            </button> ) : (
                <button className='btn btn-primary' onClick={handleSubmit}>
                    Start Checking
                   </button>
               )}
        
        {results.length > 0 && (
        <div className="row my-5">
                <center>
                    <h4 className='text-light'>Screening results</h4>
                    <div className="btn-group">
                    <button className="btn btn-success my-3" onClick={downloadCSV}>
                   <FaFileCsv />  <FaDownload /> CSV
                </button>
                <button className="btn btn-danger my-3" onClick={downloadPDF}>
                  <FaFilePdf /> <FaDownload />   PDF
                </button>
                    </div>
                <div className="col-11 table-responsive">
                
                <table className='table'>
                <thead className='table-secondary text-light'>
                    <tr>
                     <th>Rank</th>   
                    <th>CV Filename</th>
                    <th>Similarity Score</th>
                    </tr>
                </thead>
                <tbody>
                    {results.map((result, index) => {
                        let rowClass = "";

                        if (result.similarity_score >= 80) {
                        rowClass = "table-success";
                        } else if (result.similarity_score >= 60) {
                        rowClass = "table-info";
                        } else if (result.similarity_score >= 40) {
                        rowClass = "table-warning";
                        } else {
                        rowClass = "table-danger";
                        }

                        return (
                            <tr key={index} className={rowClass}>
                                <td>{index+1}</td>
                                <td>{result.cv_filename}</td>
                                <td>{result.similarity_score}%</td>
                            </tr>
                            );
                        })}

                    </tbody>
                    </table>
                
                    
             </div> 
                </center>
        </div> 
        )} 
    </center>
    </div>
  )
}

export default Home