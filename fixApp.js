import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /if \(!foundCover\) \{[\s\S]*?const getPrintStageString = \(stage: number\) => \{/m;

const replacement = `if (!foundCover) {
          try {
            const tasks = await BambuCloudApi.getTasks(cloudToken);
            if (tasks && tasks.length > 0) {
              let activeTask = tasks.find((t: any) => 
                (printTaskId && printTaskId !== '0' && (String(t.id) === String(printTaskId) || String(t.taskId) === String(printTaskId))) ||
                (printProfileId && printProfileId !== '0' && String(t.profileId) === String(printProfileId)) ||
                (printSubtask && t.title && printSubtask.toLowerCase().includes(t.title.toLowerCase()))
              );

              if (activeTask && activeTask.cover) {
                foundCover = activeTask.cover;
              }
            }
          } catch (e: any) {
             // Ignore cloud errors
          }
        }

        const isPrinting = printState !== 'OFFLINE';

        if (!isPrinting) {
           setCoverImage('');
        } else {
           setCoverImage(foundCover || '');
        }
      };
      
      fetchCover();
      interval = setInterval(fetchCover, 30000);
    } else {
      setCoverImage('');
    }
    return () => clearInterval(interval);
  }, [cloudToken, isConnected, printState, printSubtask, printTaskId, printProfileId]);

  const getPrintStageString = (stage: number) => {`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', content);
