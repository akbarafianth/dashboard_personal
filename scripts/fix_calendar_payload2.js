const fs = require('fs');
let f = 'assets/js/calendar-data.js';
let content = fs.readFileSync(f, 'utf8');

// We have two matches of the buggy JSON.stringify.
// The first is in quickForm.addEventListener('submit', ...)
// The second is in saveEventBtn.addEventListener('click', ...)

let parts = content.split('body: JSON.stringify({');

if (parts.length === 3) {
  parts[1] = `
            title,
            event_date: \`\${date}T\${time}:00\`,
            category,
            priority,
            description,
            subject_id: document.getElementById('event-subject')?.value || null
          })
        });

        quickForm.reset();
        await loadEvents();
      } catch (err) {
        console.error('Failed to add quick agenda', err);
      }
    });
  }

  // Handle Event Modal
`;

  // Second occurrence
  parts[2] = `
            title,
            event_date: \`\${date}T\${time}:00\`,
            category,
            priority,
            description,
            subject_id: document.getElementById('modal-subject')?.value || null
          })
        });

        // Reset & close
        if (titleInput) titleInput.value = '';
        if (descInput) descInput.value = '';
        if (timeInput) timeInput.value = '10:00';
        modal.classList.add('hidden');
        await loadEvents();
      } catch (err) {
        console.error('Failed to add modal agenda', err);
      }
    });
  }

  // Make sure we load the subjects dynamically
  // We'll populate modal-subject and event-subject
  const subjectSelects = [document.getElementById('event-subject'), document.getElementById('modal-subject')];
`;

// Wait, splitting and replacing might be fragile. 
// Let's use regex to grab the submit blocks
